# check_processor.py - Check Document AI processor status
import os
from dotenv import load_dotenv
from google.cloud import documentai_v1 as documentai

load_dotenv()

def check_processor():
    print("🔍 Checking Document AI processor status...")
    print("=" * 50)
    
    project_id = os.getenv("PROJECT_ID")
    location = os.getenv("LOCATION", "us")
    processor_id = os.getenv("PROCESSOR_ID")
    
    if not project_id or not processor_id:
        print("❌ Missing PROJECT_ID or PROCESSOR_ID in .env")
        return
    
    print(f"Project: {project_id}")
    print(f"Processor ID: {processor_id}")
    
    try:
        client = documentai.DocumentProcessorServiceClient()
        processor_name = client.processor_path(project_id, location, processor_id)
        
        processor = client.get_processor(name=processor_name)
        print(f"\n✅ Processor found:")
        print(f"   Name: {processor.display_name}")
        print(f"   Type: {processor.type_}")
        print(f"   State: {processor.state.name}")
        print(f"   Created: {processor.create_time}")
        
        if processor.state.name == "ENABLED":
            print("\n✅ Processor is ENABLED and ready to use!")
        else:
            print(f"\n⚠️  Processor state is {processor.state.name}. Please enable it in Google Cloud Console.")
            
    except Exception as e:
        print(f"\n❌ Failed to get processor: {e}")
        print("\nTroubleshooting:")
        print("1. Verify your PROJECT_ID in .env")
        print("2. Verify your PROCESSOR_ID in .env")
        print("3. Make sure Document AI API is enabled")
        print("4. Check that your service account has Document AI permissions")

if __name__ == "__main__":
    check_processor()
