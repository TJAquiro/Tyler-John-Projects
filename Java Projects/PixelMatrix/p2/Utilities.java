import java.io.File;
import java.io.FileNotFoundException;
import java.util.Iterator;
import java.io.PrintWriter;
import java.util.Scanner;

/**
 * A class for image Utilities such as loading an image or saving an image using command line arguments.
 */
public final class Utilities
{
	/**
	 * Opens and reads a file.
	 * Turns the file's contents into an image object and sets all the nodes and values.
	 */
    public static Image<Short> loadImage(String pgmFile)
    {
        File file = new File(pgmFile);
        try 
        {
			Scanner scnr = new Scanner(file);
			
			if (scnr.hasNextLine())
			{
				String line1 = scnr.nextLine();
				if (!line1.equals("P2"))
				{
					scnr.close();
					throw new RuntimeException();
				}
			}
			String line2 = scnr.nextLine();
			String[] hw = line2.split(" ");
			scnr.nextLine();
			String line3 = scnr.nextLine();
			String[] pixelValues = line3.split(" ");
			Image<Short> newImage = new Image<Short>(Integer.parseInt(hw[1]), Integer.parseInt(hw[0]));
			Iterator<Node<Short>> imageIterator = newImage.iterator();
			System.out.println(pixelValues[1]);
			int x = 0;
			
			while(imageIterator.hasNext())
			{
				Short num = Short.parseShort(pixelValues[x]);
				x++;
				imageIterator.next().setValue(num);
			}
			
			scnr.close();
			return newImage;
		} 
        catch (FileNotFoundException e) 
        {
			throw new RuntimeException();
		}
    }
    
    /**
	 * Saves and image object in to a file.
	 * 
	 * @param image an image object to be saved.
	 * @param pgmFile the name of the output file.
	 */
    public static void saveImage(Image<Short> image, String pgmFile)
    {
    	try {

            PrintWriter writer = new PrintWriter(new File(pgmFile));

            writer.println("P2");
            writer.println(image.getWidth() + " " + image.getHeight());
            writer.println(255);
            
            Iterator<Node<Short>> imageIterator = image.iterator();
            
            boolean first = true;
            
            while(imageIterator.hasNext())
            {
            	if(first == true)
            	{
            		writer.print(imageIterator.next().getValue());
            		first = false;
            	}
            	else
            	{
            		writer.print(" " + imageIterator.next().getValue());
            	}
            }
            writer.close();

        } 
    	catch (FileNotFoundException e) 
    	{
    		throw new RuntimeException();
        }
    }
}
