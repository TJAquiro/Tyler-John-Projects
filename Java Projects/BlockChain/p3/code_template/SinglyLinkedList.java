import java.util.Iterator;

/**
 * Implements a singly linked list.
 * @param <T> The type of elements stored in the linked list, which must be Comparable.
*/
public class SinglyLinkedList<T extends Comparable<T>> implements Iterable<T>
{
	/**
	 * The first node in the linked list.
	 */
	private Node<T> head;
	
	/**
	 * The last node in the linked list.
	 */
	private Node<T> tail;
	
	/**
	 * A variable for keeping track of the number of items in the list.
	 */
	private int size;
	
	/**
	 * Private node class.
	 * @param <T> The type of elements stored in the node.
	 */
	private class Node<T> 
	{
		/**
    	 * The data field of the node.
    	 */
		T data;
        
		/**
    	 * The next link of the node.
    	 */
		Node<T> next;
        
		/**
    	 * The constructor of the node.
    	 * @param data the data stored in the node
    	 */
		Node(T data) 
        {
            this.data = data;
            this.next = null;
        }
        
        /**
    	 * The setter for the next link of the node.
    	 * @param x the node being set as the left reference.
    	 */
        void setNext(Node<T> x)
        {
        	next = x;
        }
        
        /**
    	 * The getter for the next link of the node.
    	 * @return left node
    	 */
        Node<T> getNext()
        {
        	return next;
        }
    }
	
	/**
     * Constructor for the SinglyLinkedList object.
     */
	public SinglyLinkedList()
    {
    	this.head = null;
    	this.tail = null;
    	size = 0;
    }

    /**
     * adds a value to the end of the list.
     * @param value the value being added.
     */
    public void add(T value)
    {
    	size++;
    	
    	Node<T> node = new Node<>(value);
    	
    	if(head == null)
    	{
    		head = node;
    	}
    	if(tail == null)
    	{
    		tail = node;
    	}
    	else
    	{
    		tail.setNext(node);
    		tail = node;
    	}
    }
    
    /**
     * Inserts a value to the proper location in the list so that the list order is preserved (in descending order).
     * @param newValue the value being inserted.
     */
    public void insert(T newValue)
    {
    	
    	if(size == 0)
    	{
    		add(newValue);
    	}
    	
    	else
    	{	
    		size++;
    		
    		Node<T> node = new Node<>(newValue);
        	
        	if(newValue.compareTo(head.data) >= 0)
        	{	
        		node.next = head;
                head = node;
            }
        	else if(newValue.compareTo(tail.data) <= 0)
        	{	
        		tail.next = node;
                tail = node;
            }
        	else
        	{
        		Node<T> current = head;
            	
                while (current.next != null) 
                {
                	if(newValue.compareTo(current.next.data) > 0)
                	{
                		node.setNext(current.getNext());
                        current.setNext(node);
                        break;
                	}
                	else
                	{
                		current = current.next;
                	}
                }
        	}
    	}
    }
    
    /**
     * Removes a single item from the list based on its index.
     * @param index the index of the value being removed.
     * @return T the value removed
     */
    public T remove(int index)
    {
    	if(size == 0 || index > size-1)
    	{
    		throw new IndexOutOfBoundsException();
    	}
    	
    	size--;
    	
    	T returnval = null;
    	
    	if(index == 0)
    	{
    		returnval = head.data;
    		
    		if(head.getNext() == null)
    		{
    			head = null;
    		}
    		else
    		{
    			head = head.getNext();
    		}
    		return returnval;
    	}
    	
    	Node<T> current = head;
    	
    	for(int x = 0;x < index-1; ++x)
    	{
    		current = current.getNext();
    	}
    	
    	returnval = current.getNext().data;
    	
    	current.setNext(current.getNext().getNext());
    	
    	return returnval;
    }

    /**
     * Returns (without removing) a single item from the list based on its index.
     * @param index the index of the value being returned.
     * @return T the value at that index.
     */
    public T get(int index)
    {
    	if(index > size-1)
    	{
    		throw new IndexOutOfBoundsException();
    	}
    	
    	Node<T> current = head;
    	
    	for(int x = 0;x < index; ++x)
    	{
    		current = current.getNext();
    	}
    	
    	return current.data;
    }

    /**
     * Returns size of the list.
     * @return int a number representing the size of the list.
     */
    public int size()
    {
		return size;
    }

    /**
     * Checks if the list is empty.
     * @return boolean whether the list is empty.
     */
    public boolean isEmpty()
    {
		return (size == 0);
    }
    
	/**
     * Returns an Iterator object for the list.
     * @return Iterator.
     */
	@Override
	public Iterator<T> iterator() 
	{
		return new Iterator<T>()
		{
			/**
		     * A pointer for the current item.
		     */
			private Node<T> mycurrent = head;
			
			/**
		     * Checks if the mycurrent pointer is null.
		     * @return boolean representing if there is another object next.
		     */
			public boolean hasNext() 
			{
				return mycurrent != null;
			}
			
			/**
		     * Gets the mycurrent node and moves the pointer forward one.
		     * @return mycurrent node.
		     */
			public T next()
			{
				Node<T> returnVal = mycurrent;
				
				mycurrent = mycurrent.getNext();
				
				return returnVal.data;
			}
        };
	}
}
