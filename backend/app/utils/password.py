import base64
import hashlib
import hmac
import os
from typing import Tuple

# PBKDF2-SHA256 alapú hash, saját sóval; nincs külső függőség.

_ITERATIONS = 200_000
_SALT_BYTES = 16

def _split(encoded: str) -> Tuple[bytes, bytes, int]: # Felbontja a kódolt jelszó hash-t sóra, digestre és iterációkra
    try:
        salt_b64, digest_b64, iter_str = encoded.split("$") # formátum: salt$digest$iterations
        return base64.b64decode(salt_b64), base64.b64decode(digest_b64), int(iter_str) # dekódolja a bázis64-et és konvertálja az iterációkat int-re
    except Exception as e:
        raise ValueError("Invalid password hash format") from e # Hibát dob, ha a formátum érvénytelen

def hash_password(password: str) -> str:
    if not isinstance(password, str) or password == "":
        raise ValueError("Password must be a non-empty string") # Ellenőrzi, hogy a jelszó nem üres string
    salt = os.urandom(_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _ITERATIONS) # PBKDF2-HMAC-SHA256 hash generálása
    return f"{base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}${_ITERATIONS}" # Visszaadja a kódolt formátumot: salt$digest$iterations

def verify_password(password: str, encoded: str) -> bool: # Ellenőrzi a jelszót a kódolt hash-sel
    salt, correct_digest, iters = _split(encoded) # Felbontja a kódolt hash-t
    test_digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iters) # Újra generálja a digestet a megadott jelszóval és sóval
    return hmac.compare_digest(test_digest, correct_digest) # Biztonságos összehasonlítás a helyes digest-tel