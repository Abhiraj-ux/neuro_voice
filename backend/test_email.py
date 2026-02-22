# backend/test_email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    GMAIL_USER: str = ""
    GMAIL_PASS: str = ""
    class Config:
        env_file = ".env"

def test_smtp():
    # Force load from .env in the root
    if os.path.exists("../.env"):
        from dotenv import load_dotenv
        load_dotenv("../.env")
    
    conf = Settings()
    
    if not conf.GMAIL_USER or not conf.GMAIL_PASS:
        print("❌ Error: GMAIL_USER or GMAIL_PASS not found in .env")
        return

    print(f"📡 Attempting to connect to SMTP with user: {conf.GMAIL_USER}...")
    
    try:
        msg = MIMEMultipart()
        msg['From'] = f"NeuroVoice Test <{conf.GMAIL_USER}>"
        msg['To'] = conf.GMAIL_USER  # Send to yourself
        msg['Subject'] = "🧪 NeuroVoice Email Test"
        
        body = "If you are reading this, your Google App Password is working correctly! ✅"
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(conf.GMAIL_USER, conf.GMAIL_PASS)
        server.send_message(msg)
        server.quit()
        print("✅ SUCCESS! Test email sent specifically to your inbox.")
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        if "Username and Password not accepted" in str(e):
            print("\n💡 TIP: This usually means the App Password is wrong or you used your regular password.")

if __name__ == "__main__":
    test_smtp()
