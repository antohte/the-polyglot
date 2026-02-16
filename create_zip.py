import zipfile
import os
import datetime

def zip_server_folder():
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    zip_name = f"server-deployment-{timestamp}.zip"
    
    server_dir = os.path.join(os.getcwd(), 'server')
    
    print(f"Creating zip: {zip_name}")
    
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(server_dir):
            # Exclude node_modules
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            
            for file in files:
                # Exclude .env files
                if file.startswith('.env'):
                    continue
                
                file_path = os.path.join(root, file)
                # Calculate relative path for the zip entry
                # We want the content of 'server/' to be at the root of the zip, or inside a folder?
                # The PS script put them at the root.
                # Let's put them at the root of the zip.
                arcname = os.path.relpath(file_path, server_dir)
                
                print(f"Adding {arcname}")
                try:
                    zipf.write(file_path, arcname)
                except Exception as e:
                    print(f"Error adding {file_path}: {e}")

    print(f"Zip created successfully: {zip_name}")

if __name__ == "__main__":
    zip_server_folder()
