#!/usr/bin/env python3
"""
Setup script for RAG with ChromaDB example
"""

import os
import subprocess
import sys

def install_requirements():
    """Install required packages"""
    print("📦 Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False
    return True

def check_env_vars():
    """Check if required environment variables are set"""
    print("🔍 Checking environment variables...")
    
    required_vars = ["OPENAI_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("📝 Please set them in your environment or create a .env file")
        print("💡 You can copy .env.example to .env and fill in your API keys")
        return False
    
    print("✅ All required environment variables are set!")
    return True

def create_directories():
    """Create necessary directories"""
    print("📁 Creating directories...")
    directories = ["documentos_pdf", "chroma_db"]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def main():
    """Main setup function"""
    print("🚀 Setting up RAG with ChromaDB example")
    print("=" * 50)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Check environment variables
    if not check_env_vars():
        print("\n⚠️  Please set the required environment variables before running the example")
        print("   You can run: python rag_com_chroma.py")
        print("   But it will fail without the OpenAI API key")
    
    # Create directories
    create_directories()
    
    print("\n🎉 Setup completed!")
    print("📝 Next steps:")
    print("   1. Set your OPENAI_API_KEY environment variable")
    print("   2. Run: python rag_com_chroma.py")
    print("   3. Enjoy the RAG system with ChromaDB!")

if __name__ == "__main__":
    main()
