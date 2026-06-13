import zipfile
import xml.etree.ElementTree as ET

docx_path = "D:\\សៀវភៅសិក្ខាគារិកមធមសិក្សា_ដោយ_ម៉ៅ_សុចិត្រា_MAO_SOJETRA.docx"

try:
    with zipfile.ZipFile(docx_path) as z:
        doc_xml = z.read("word/document.xml")
        root = ET.fromstring(doc_xml)
        
        texts = []
        for elem in root.iter():
            if elem.tag.endswith('t'):
                if elem.text:
                    texts.append(elem.text)
                    
        full_text = "\n".join(texts)
        
        # Write to file in UTF-8
        with open("scratch/extracted_text.txt", "w", encoding="utf-8") as f:
            f.write(full_text)
            
        print("Success! Extracted text written to scratch/extracted_text.txt")
except Exception as e:
    print("Error reading docx:", e)
