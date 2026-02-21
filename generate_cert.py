# generate_cert.py
# Generates a self-signed TLS cert for Vite HTTPS using Python's cryptography lib.
# Works 100% offline — no network needed.
import os, ipaddress, datetime
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa

OUT_DIR = os.path.join(os.path.dirname(__file__), "certs")
os.makedirs(OUT_DIR, exist_ok=True)
KEY_PATH  = os.path.join(OUT_DIR, "key.pem")
CERT_PATH = os.path.join(OUT_DIR, "cert.pem")

# ── Generate RSA private key ───────────────────────────────────────────────
key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

# ── Build cert ─────────────────────────────────────────────────────────────
subject = issuer = x509.Name([
    x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
])

# Add all LAN IPs so iPhone can reach it
san_ips = [
    ipaddress.ip_address("127.0.0.1"),
    ipaddress.ip_address("10.38.10.7"),       # your WiFi IP
    ipaddress.ip_address("192.168.56.1"),
    ipaddress.ip_address("192.168.56.2"),
    ipaddress.ip_address("192.168.255.1"),
    ipaddress.ip_address("192.168.80.1"),
]

cert = (
    x509.CertificateBuilder()
    .subject_name(subject)
    .issuer_name(issuer)
    .public_key(key.public_key())
    .serial_number(x509.random_serial_number())
    .not_valid_before(datetime.datetime.utcnow())
    .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=825))
    .add_extension(x509.SubjectAlternativeName(
        [x509.DNSName(u"localhost")] +
        [x509.IPAddress(ip) for ip in san_ips]
    ), critical=False)
    .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
    .sign(key, hashes.SHA256())
)

# ── Write files ────────────────────────────────────────────────────────────
with open(KEY_PATH, "wb") as f:
    f.write(key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    ))

with open(CERT_PATH, "wb") as f:
    f.write(cert.public_bytes(serialization.Encoding.PEM))

print(f"✅  Key  → {KEY_PATH}")
print(f"✅  Cert → {CERT_PATH}")
print("\n📱 iPhone setup:")
print("   1. Connect iPhone and PC to the SAME Wi-Fi")
print("   2. Open Safari on iPhone → https://10.38.10.7:5174")
print("   3. Tap 'Advanced' → 'Proceed to 10.38.10.7 (unsafe)'")
print("   4. Allow microphone when prompted")
