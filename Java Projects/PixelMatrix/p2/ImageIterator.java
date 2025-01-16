import java.util.Iterator;

/**
 * A class that creates an Iterator for images.
 * 
 * @param head the first node in the image.
 * @param current the pointer for indexing which node is being called.
 * @param width the horizontal size of the image.
 * @param height the vertical size of the image.
 */
public class ImageIterator<T extends Comparable<T>> implements Iterator<Node<T>>
{
	private Node<T> head;
	private Node<T> current;
	private int width;
	private int height;
	
	/**
	 * The constructor for ImageIterator.
	 * 
	 * @param Image, the image that we will create an Iterator for.
	 */
	private ImageIterator(Image<T> image)
	{
		head = image.getHead();
		current = image.getHead();
		width = image.getWidth();
		height = image.getHeight();
	}
	
	/**
	 * @Override
	 * Overrides the original implementation of hasNext(), returns whether current is a valid node.
	 */
	public boolean hasNext() 
	{
		return current instanceof Node;
	}

	/**
	 * @Override
	 * Overrides the original implementation of next(), returns the current node and changes the current node to the next in the sequence.
	 */
	public Node<T> next() 
	{
		Node<T> returnVal = current;
		
		if(current.getRight() instanceof Node)
		{
			current = current.getRight();
		}
		else
		{
			Node<T> pointer = current;
			
			for(int x = 0;x < width-1; ++x)
			{
				pointer = pointer.getLeft();
			}
			current = pointer.getDown();
		}
		return returnVal;
	}
}
