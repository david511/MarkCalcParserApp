import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.RandomAccessFile;

import org.apache.pdfbox.cos.COSDocument;
import org.apache.pdfbox.io.RandomAccessRead;
import org.apache.pdfbox.pdfparser.PDFParser;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

public class PDF_Manager
{

	private PDFParser parser;
	
	private PDFTextStripper pdfStripper;
	private PDDocument pdDoc;
	private COSDocument cosDoc;
	private String Text;
	private String filePath;
	private File file;

	public PDF_Manager()
	{
		this.Text = null;
		this.filePath = null;		
	}

	public String text() throws IOException
	{
		file = new File(filePath);
		parser =new PDFParser(new org.apache.pdfbox.io.RandomAccessFile(file, "r"));
		
		parser.parse();
		cosDoc = parser.getDocument();
		pdfStripper = new PDFTextStripper();
		pdDoc = new PDDocument(cosDoc);
		pdDoc.getNumberOfPages();
		pdfStripper.setStartPage(0);
		Text = pdfStripper.getText(pdDoc);
	
		return Text;
	}

	public void create_txt_file(String filePath, String fileName) throws IOException
	{
		String output_file_str = text();
		// System.out.println(output_file_str);
		fileName = fileName.replace(".pdf", ".txt");
		String newFilePath = "uploads/" + fileName;

		System.out.println(filePath.concat(fileName) + " and " + newFilePath);
		try {
		    BufferedWriter writer =
					// new BufferedWriter(new FileWriter(filePath.concat(fileName)));
					new BufferedWriter(new FileWriter(newFilePath));
		    writer.write(output_file_str);
		     
		    writer.close();
		    System.out.println("Success '" + fileName + "'' got converted to .txt");
		} catch (IOException e) {
			
			System.err.println(e.getMessage());
		}
	}
	
	public void setFilePath(String filePath)
	{
		this.filePath = filePath;
	}
	
	public PDDocument getPdDoc()
	{
		return pdDoc;
	}
}
