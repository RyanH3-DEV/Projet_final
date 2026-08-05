<?php

namespace App\Doctrine;

use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\StringType;

class EncryptedStringType extends StringType
{
    private const CIPHER = 'aes-256-cbc';

    public function convertToDatabaseValue($value, AbstractPlatform $platform): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        $key = hex2bin($_ENV['APP_ENCRYPTION_KEY']);
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length(self::CIPHER));
        $encrypted = openssl_encrypt($value, self::CIPHER, $key, 0, $iv);

        return base64_encode($iv . $encrypted);
    }

    public function convertToPHPValue($value, AbstractPlatform $platform): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        $key = hex2bin($_ENV['APP_ENCRYPTION_KEY']);
        $decoded = base64_decode($value);
        $ivLength = openssl_cipher_iv_length(self::CIPHER);
        $iv = substr($decoded, 0, $ivLength);
        $encrypted = substr($decoded, $ivLength);

        $decrypted = openssl_decrypt($encrypted, self::CIPHER, $key, 0, $iv);

        return $decrypted !== false ? $decrypted : $value;
    }

    public function getName(): string
    {
        return 'encrypted_string';
    }
}
