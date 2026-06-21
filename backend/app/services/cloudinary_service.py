import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from dotenv import load_dotenv
import os
import requests

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


def upload_file_to_cloudinary(file_content: bytes, filename: str, file_type: str) -> dict:
    """Upload file to Cloudinary"""
    try:
        result = cloudinary.uploader.upload(
            file_content,
            public_id=filename,
            resource_type="raw",
            type="upload",
            access_mode="public",
            folder="ai-legal-assistant",
            timeout=60
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        raise e


def download_file_from_cloudinary(public_id: str) -> bytes:
    """Download file from Cloudinary using signed URL"""
    try:
        signed_url, _ = cloudinary_url(
            public_id,
            resource_type="raw",
            type="upload",
            sign_url=True,
            api_key=os.getenv("CLOUDINARY_API_KEY"),
            api_secret=os.getenv("CLOUDINARY_API_SECRET")
        )
        print(f"Downloading from signed URL: {signed_url[:80]}...")
        response = requests.get(signed_url, timeout=30)
        print(f"Download status: {response.status_code}, size: {len(response.content)}")
        if response.status_code == 200:
            return response.content
        return b""
    except Exception as e:
        print(f"Cloudinary download failed: {e}")
        return b""


def delete_file_from_cloudinary(public_id: str):
    """Delete file from Cloudinary"""
    try:
        cloudinary.uploader.destroy(public_id, resource_type="raw")
    except Exception as e:
        print(f"Cloudinary delete error: {e}")