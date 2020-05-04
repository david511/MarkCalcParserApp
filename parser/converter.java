import java.io.IOException;



public class converter
{
	public static void main(String[] args)
	{
		String path = args[0];

		PDF_Manager pdf = new PDF_Manager();
		pdf.setFilePath(path);
			
		try {
			String[] path_links = path.split("/");
			int path_length = path_links.length;
		
			String fileName = path_links[path_length - 1];
			
			//removing the filename from the file path
            String tempWord = fileName;
            path = path.replaceAll(tempWord, ""); 
            tempWord = " " + fileName; 
            path = path.replaceAll(tempWord, ""); 

			/*call function to produce .txt file from string*/
			pdf.create_txt_file(path, fileName);
		} catch (IOException ex) {
			System.err.println(ex.getMessage());
		}
	}
}
