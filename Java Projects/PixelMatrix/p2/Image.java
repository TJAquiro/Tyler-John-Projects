import java.util.Iterator;

/**
 * This is a sample Java class that represents an Image.
 * It stores information such as the Image's height and width.
 * Tells the user where the head of the image is.
 * 
 * @param head the first node in the image.
 * @param width the horizontal size of the image.
 * @param height the vertical size of the image.
 */
public class Image<T extends Comparable<T>> implements Iterable<Node<T>>
{
	private Node<T> head;
	private int width;
	private int height;
	
	/**
	 * This is the constructor for the Image object.
	 * Constructs a grid of nodes and sets up, down, left and right references to each of the other nodes.
	 *
	 * @param width, the width of the image.
     * @param height, the height of the image.
     */
	public Image(int width, int height)
	{
		this.width = width;
		this.height = height;
		Node<T> lastnode = null;
		Node<T> previousRowHead = null;
		
		for(int x = 0;x < height; ++x)
		{	
			if(previousRowHead == null)
			{
				for(int y = 0;y < width; ++y)
				{
					Node<T> currentnode = new Node<>();
					currentnode.setLeft(lastnode);

					if(currentnode.getLeft() != null)
					{
						currentnode.getLeft().setRight(currentnode);
					}
					if(y == 0)
					{
						head = currentnode;
						previousRowHead = currentnode;
					}
					lastnode = currentnode;
				}
			}
			else
			{
				lastnode = null;
				Node<T> abovenode = null;
				Node<T> currentnode = new Node<>();
				previousRowHead.setDown(currentnode);
				abovenode = previousRowHead;
				currentnode.setUp(previousRowHead);
				
				for(int y = 0;y < width; ++y)
				{
					currentnode.setLeft(lastnode);

					if(currentnode.getLeft() != null)
					{
						currentnode.getLeft().setRight(currentnode);
					}
					currentnode.setUp(abovenode);
					abovenode.setDown(currentnode);
					
					if(y == 0)
					{
						previousRowHead = currentnode;
					}
					abovenode = abovenode.getRight();
					lastnode = currentnode;
					currentnode = new Node<>();
				}
			}
		}
	}
	
	/**
	 * This is the getter for Height.
	 *
	 * @return height integer height of the image.
     */
	public int getHeight()
	{
		return height;
	}
	
	/**
	 * This is the getter for width.
	 *
	 * @return width integer width of the image.
     */
	public int getWidth()
	{
		return width;
	}
	
	/**
	 * This is the getter for the head.
	 *
	 * @return head the first Node<T> of the image.
     */
	public Node<T> getHead()
	{
		return head;
	}
	
	/**
	 * This inserts a row at a given index.
	 *
	 * @param index the index where the row will appear in.
	 * @param the value of all the nodes in the added row.
     */
	public void insertRow(int index, T value)
	{
		Node<T> pointer = head;
		Node<T> lastnode = null;
		
		if(index == 0)
		{
			for(int x = 0;x < width; ++x)
			{
				Node<T> currentnode = new Node<>();
				currentnode.setValue(value);
				pointer.setUp(currentnode);
				currentnode.setLeft(lastnode);
				currentnode.setDown(pointer);
				
				if(lastnode instanceof Node)
				{
					lastnode.setRight(currentnode);
				}
				if(x == 0)
				{
					head = currentnode;
				}
				pointer = pointer.getRight();
				lastnode = currentnode;
			}
			height++;
		}
		else if(index < height)
		{
			for(int x = 0;x < index-1; ++x)
			{
				pointer = pointer.getDown();
			}
			for(int x = 0;x < width; ++x)
			{
				Node<T> currentnode = new Node<>();
				currentnode.setValue(value);
				currentnode.setUp(pointer);
				currentnode.setDown(pointer.getDown());
				pointer.setDown(currentnode);
				currentnode.getDown().setUp(currentnode);
				currentnode.setLeft(lastnode);
				
				if(lastnode instanceof Node)
				{
					lastnode.setRight(currentnode);
				}
				pointer = pointer.getRight();
				lastnode = currentnode;
			}
			height++;
		}
		else if(index == height)
		{
			for(int x = 0;x < height-1; ++x)
			{
				pointer = pointer.getDown();
			}
			for(int x = 0;x < width; ++x)
			{
				Node<T> currentnode = new Node<>();
				currentnode.setValue(value);
				pointer.setDown(currentnode);
				currentnode.setLeft(lastnode);
				currentnode.setUp(pointer);
				
				if(lastnode instanceof Node)
				{
					lastnode.setRight(currentnode);
				}
				pointer = pointer.getRight();
				lastnode = currentnode;
			}
			height++;
		}
		else
		{
			throw new RuntimeException();
		}
	}
	
	/**
	 * This removes a Column at a given index.
	 *
	 * @param Index the index of the Column that will be removed.
     */
	public void removeColumn(int index)
	{
		Node<T> pointer = head;
		
		if(index == 0)
		{
			head = pointer.getRight();
			
			for(int x = 0;x < height; ++x)
			{
				pointer.getRight().setLeft(null);
				pointer.setRight(null);
				pointer = pointer.getDown();
			}
		}
		else if(index < width-1)
		{	
			for(int x = 0;x < index; ++x)
			{
				pointer = pointer.getRight();
			}
			for(int x = 0;x < height; ++x)
			{
				pointer.getRight().setLeft(pointer.getLeft());
				pointer.getLeft().setRight(pointer.getRight());
				pointer.setLeft(null);
				pointer.setRight(null);
				pointer = pointer.getDown();
			}
		}
		else if(index == width-1)
		{
			for(int x = 0;x < index; ++x)
			{
				pointer = pointer.getRight();
			}
			for(int x = 0;x < height; ++x)
			{
				pointer.getLeft().setRight(pointer.getRight());
				pointer.setLeft(null);
				pointer = pointer.getDown();
			}
		}
		else
		{
			throw new RuntimeException();
		}
		width--;
	}
	
	/**
	 * This is a helper method that removes a Row at a given index.
	 *
	 * @param Index the index of the row that will be removed.
     */
	private void removeRow(int index)
	{
		Node<T> pointer = head;
		
		if(index == 0)
		{
			head = pointer.getDown();
			
			for(int x = 0;x < width; ++x)
			{
				pointer.getDown().setUp(null);
				pointer.setDown(null);
				pointer = pointer.getRight();
			}
		}
		else if(index < height-1)
		{
			for(int x = 0;x < index; ++x)
			{
				pointer = pointer.getDown();
			}
			for(int x = 0;x < width; ++x)
			{
				pointer.getDown().setUp(pointer.getUp());
				pointer.getUp().setDown(pointer.getDown());
				pointer.setUp(null);
				pointer.setDown(null);
				pointer = pointer.getRight();
			}
			
		}
		else if(index == height-1)
		{
			for(int x = 0;x < index; ++x)
			{
				pointer = pointer.getDown();
			}
			for(int x = 0;x < width; ++x)
			{	
				pointer.getUp().setDown(pointer.getDown());
				pointer.setUp(null);
				pointer = pointer.getRight();
			}
		}
		else
		{
			throw new RuntimeException();
		}
		height--;
	}
	
	/**
	 * If two adjacent rows or columns have the same values, it removes one of the two from the image. 
	 * The whole process repeats until no adjacent rows or columns have the same values.
	 *
     */
	public int compress()
	{
		int nodesRemoved = 0;
		
		for(int z = 0;z < 5; ++z)
		{
			Node<T> pointer = head;
			Node<T> RemoverPointer;
			int colIndex = 0;
			boolean misMatchFound = false;
			
			for(int x = 0;x < width; ++x)
			{
				if(pointer.getRight() instanceof Node && pointer.compareTo(pointer.getRight()) == 0)
				{
					RemoverPointer = pointer;
					
					for(int y = 0;y < height; ++y)
					{
						if(RemoverPointer.getRight() instanceof Node && pointer.compareTo(pointer.getRight()) != 0)
						{
							misMatchFound = true;
						}
						RemoverPointer = RemoverPointer.getDown();
					}
					if(!misMatchFound)
					{
						this.removeColumn(colIndex+1);
						nodesRemoved = nodesRemoved + height;
					}
				}
				else
				{
					pointer = pointer.getRight();
					colIndex++;
				}
			}
		}
		for(int z = 0;z < 5; ++z)
		{
			Node<T> pointer = head;
			Node<T> RemoverPointer;
			int rowIndex = 0;
			boolean misMatchFound = false;
			
			for(int x = 0;x < height; ++x)
			{
				if(pointer.getDown() instanceof Node && pointer.compareTo(pointer.getDown()) == 0)
				{
					RemoverPointer = pointer;
					
					for(int y = 0;y < width; ++y)
					{
						if(RemoverPointer.getDown() instanceof Node && pointer.compareTo(pointer.getDown()) != 0)
						{
							misMatchFound = true;
						}
						RemoverPointer = RemoverPointer.getRight();
					}
					if(!misMatchFound)
					{
						this.removeRow(rowIndex+1);
						nodesRemoved = nodesRemoved + width;
					}
				}
				else
				{
					pointer = pointer.getDown();
					rowIndex++;
				}
			}
		}
		return nodesRemoved;
	}
	
	/**
	 * Adds a border to the parameter of the image. 
	 * The border has a width of 1 pixel and, thus, it increases the height and the width of the image by 2 pixels in each dimension. 
	 * The value of each pixel in the border is the same with its adjacent pixel in the original image.
	 * 
     */
	public void addBorder()
	{
		Node<T> innerpointer = head;
		Node<T> lastnode = null;
		Node<T> beginningnode = null;

		for(int x = 0;x < width; ++x)
		{
			Node<T> currentnode = new Node<T>();
			
			if(x == 0)
			{
				beginningnode = currentnode;
			}
			currentnode.setValue(innerpointer.getValue());
			innerpointer.setUp(currentnode);
			innerpointer.getUp().setDown(innerpointer);
			
			if(lastnode != null)
			{
				currentnode.setLeft(lastnode);
				currentnode.getLeft().setRight(currentnode);
			}
			if(x == width-1)
			{
				Node<T> cornernode = new Node<T>();
				cornernode.setValue(currentnode.getValue());
				cornernode.setLeft(currentnode);
				cornernode.getLeft().setRight(cornernode);
				lastnode = cornernode;
			}
			else
			{
				innerpointer = innerpointer.getRight();
				lastnode = currentnode;
			}
		}
		for(int x = 0;x < height; ++x)
		{
			Node<T> currentnode = new Node<T>();
			currentnode.setValue(innerpointer.getValue());
			innerpointer.setRight(currentnode);
			innerpointer.getRight().setLeft(innerpointer);
			
			if(lastnode != null)
			{
				currentnode.setUp(lastnode);
				currentnode.getUp().setDown(currentnode);
			}
			if(x == height-1)
			{
				Node<T> cornernode = new Node<T>();
				cornernode.setValue(currentnode.getValue());
				cornernode.setUp(currentnode);
				cornernode.getUp().setDown(cornernode);
				lastnode = cornernode;
			}
			else
			{
				innerpointer = innerpointer.getDown();
				lastnode = currentnode;
			}
		}
		for(int x = 0;x < width; ++x)
		{
			Node<T> currentnode = new Node<T>();
			currentnode.setValue(innerpointer.getValue());
			innerpointer.setDown(currentnode);
			innerpointer.getDown().setUp(innerpointer);
			
			if(lastnode != null)
			{
				currentnode.setRight(lastnode);
				currentnode.getRight().setLeft(currentnode);
			}
			if(x == width-1)
			{
				Node<T> cornernode = new Node<T>();
				cornernode.setValue(currentnode.getValue());
				cornernode.setRight(currentnode);
				cornernode.getRight().setLeft(cornernode);
				lastnode = cornernode;
			}
			else
			{
				innerpointer = innerpointer.getLeft();
				lastnode = currentnode;
			}
		}
		for(int x = 0;x < height; ++x)
		{
			Node<T> currentnode = new Node<T>();
			currentnode.setValue(innerpointer.getValue());
			innerpointer.setLeft(currentnode);
			innerpointer.getLeft().setRight(innerpointer);
			
			if(lastnode != null)
			{
				currentnode.setDown(lastnode);
				currentnode.getDown().setUp(currentnode);
			}
			
			if(x == height-1)
			{
				Node<T> cornernode = new Node<T>();
				cornernode.setValue(currentnode.getValue());
				cornernode.setDown(currentnode);
				cornernode.getDown().setUp(cornernode);
				cornernode.setRight(beginningnode);
				cornernode.getRight().setLeft(cornernode);
				head = cornernode;
				lastnode = cornernode;
			}
			else
			{
				innerpointer = innerpointer.getUp();
				lastnode = currentnode;
			}
		}
		width = width + 2;
		height = height + 2;
	}
	
	/**
	 * Removes the borderline pixels from the image. 
	 * The border has a width of 1 pixel and, thus, it decreases the height and the width of the image by 2 pixels in each dimension.
	 * 
     */
	public void removeBorder()
	{
		if(height < 3 || width < 3)
		{
			throw new RuntimeException();
		}
		else
		{
			this.removeRow(0);
			this.removeRow(height-1);
			this.removeColumn(0);
			this.removeColumn(width-1);
		}
	}
	
	/**
	 * It creates a new image that has the same size with the original, but the value of each pixel is replaced by the maximum value in its neighborhood. 
	 * The default neighborhood is a 3x3 region centered on the pixel examined, but it will be smaller for pixels close to the border and the corners.
	 * 
	 * @return a new Image<T> object with the above transformations applied.
     */
	public Image<T> maxFilter()
	{
		Image<T> returnImage = new Image<T>(width, height);
		Iterator<Node<T>> it = returnImage.iterator();
		Iterator<Node<T>> thisIt = this.iterator();
		
		while(thisIt.hasNext())
		{
			it.next().setValue((this.maxSurrounding(thisIt.next())));
		}
		return returnImage;
	}
	
	/**
	 * Compares every value around node to find the highest.
	 * 
	 * @param node, the node that will be tested.
	 * @return T the max of the surrounding values around node.
     */
	private T maxSurrounding(Node<T> node)
	{
		T returnval = null;

		if(node.getUp() instanceof Node)
		{
			returnval = node.getUp().getValue();
		}
		else if(node.getRight() instanceof Node)
		{
			returnval = node.getRight().getValue();
		}
		else if(node.getDown() instanceof Node)
		{
			returnval = node.getDown().getValue();
		}
		else if(node.getLeft() instanceof Node)
		{
			returnval = node.getLeft().getValue();
		}

		if(node.getUp() instanceof Node 
				&& node.getUp().getLeft() instanceof Node 
				&& node.getUp().getLeft().getValue() != null
				&& returnval.compareTo(node.getUp().getLeft().getValue()) < 0)
		{
			returnval = node.getUp().getLeft().getValue();
		}
		if(node.getUp() instanceof Node 
				&& node.getUp().getValue() != null
				&& returnval.compareTo(node.getUp().getValue()) < 0)
		{
			returnval = node.getUp().getValue();
		}
		if(node.getUp() instanceof Node 
				&& node.getUp().getRight() instanceof Node 
				&& node.getUp().getRight().getValue() != null
				&& returnval.compareTo(node.getUp().getRight().getValue()) < 0)
		{
			returnval = node.getUp().getRight().getValue();
		}
		if(node.getLeft() instanceof Node 
			&& node.getLeft().getValue() != null
			&& returnval.compareTo(node.getLeft().getValue()) < 0)
		{
			returnval = node.getLeft().getValue();
		}
		if(node.getRight() instanceof Node 
			&& node.getRight().getValue() != null
			&& returnval.compareTo(node.getRight().getValue()) < 0)
		{
			returnval = node.getRight().getValue();
		}
		if(node.getDown() instanceof Node 
				&& node.getDown().getLeft() instanceof Node 
				&& node.getDown().getLeft().getValue() != null
				&& returnval.compareTo(node.getDown().getLeft().getValue()) < 0)
		{
			returnval = node.getDown().getLeft().getValue();
		}
		if(node.getDown() instanceof Node 
				&& node.getDown().getValue() != null
				&& returnval.compareTo(node.getDown().getValue()) < 0)
		{
			returnval = node.getDown().getValue();
		}
		if(node.getDown() instanceof Node 
				&& node.getDown().getRight() instanceof Node 
				&& node.getDown().getRight().getValue() != null
				&& returnval.compareTo(node.getDown().getRight().getValue()) < 0)
		{
			returnval = node.getDown().getRight().getValue();
		}
		return returnval;
	}
	
	/**
	 * Creates an Iterator object that iterates horizontally.
	 * 
	 * @return Iterator<Node<T>> an iterator for this image object.
     */
	public Iterator<Node<T>> iterator()
	{
		return new Iterator<Node<T>>()
		{
			private Node<T> mycurrent = head;
			
			public boolean hasNext() 
			{
				return mycurrent instanceof Node;
			}

			public Node<T> next() 
			{
				Node<T> returnVal = mycurrent;
				
				if(mycurrent.getRight() instanceof Node)
				{
					mycurrent = mycurrent.getRight();
				}
				else
				{
					Node<T> pointer = mycurrent;
					
					for(int x = 0;x < width-1; ++x)
					{
						pointer = pointer.getLeft();
					}
					mycurrent = pointer.getDown();
				}
				return returnVal;
			}
			
			public void remove()
			{
				throw new UnsupportedOperationException();
			}
        };
	}
	
	/**
	 * Creates an Iterator object that iterates horizontally or vertically.
	 * 
	 * @param enum Direction either HORIZONTAL or VERTICAL.
	 * @return Iterator<Node<T>> an iterator for this image object.
     */
	public Iterator<Node<T>> iterator(Direction dir)
	{
		if(dir == Direction.HORIZONTAL)
		{
			return iterator();
		}
		else if(dir == Direction.VERTICAL)
		{
			return new Iterator<Node<T>>()
			{
				private Node<T> mycurrent = head;
				
				public boolean hasNext() 
				{
					return mycurrent instanceof Node;
				}

				public Node<T> next() 
				{
					Node<T> returnVal = mycurrent;
					
					if(mycurrent.getDown() instanceof Node)
					{
						mycurrent = mycurrent.getDown();
					}
					else
					{
						Node<T> pointer = mycurrent;
						
						for(int x = 0;x < height-1; ++x)
						{
							pointer = pointer.getUp();
						}
						mycurrent = pointer.getRight();
					}
					return returnVal;
				}
				
				public void remove()
				{
					throw new UnsupportedOperationException();
				}
	        };
		}
		else
		{
			return null;
		}
	}
	
	/**
	 * Turns all the images nodes into a String which can be read.
	 * 
	 * @return A string of all the values of all the nodes in the image separated into rows and columns.
     */
	public String toString()
	{
		String returnString = "";
		Iterator<Node<T>> imageIterator = this.iterator(Direction.HORIZONTAL);
		int nextline = 0;
		
		while(imageIterator.hasNext())
		{
			returnString = returnString + imageIterator.next().getValue() + " ";
			nextline++;
			
			if(nextline % width == 0)
			{
				returnString = returnString + "\n";
			}
		}
		return returnString;
	}
}
