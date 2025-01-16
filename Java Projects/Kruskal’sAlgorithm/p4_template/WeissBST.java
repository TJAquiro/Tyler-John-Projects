// Binary Search Tree class From your textbook (Weiss)

//TODO:
//  (1) Update this code to meet the code style and JavaDoc style requirements.
//			Why? So that you get experience with the code for a binary search tree!
//			Also, this happens a lot in industry (updating old code
//			to meet your new standards). 
//  (2) Change remove() to be "predecessor replacement".
//  (3) Implement three more methods needed by other classes of this project:
//		size(),  toString(), and values(). Make sure to add JavaDoc for those. 


import java.util.LinkedList; //only for the return of values(), do not use it anywhere else

/**
 * Implements an unbalanced binary search tree.
 * Note that all "matching" is based on the compareTo method.
 * @author Mark Allen Weiss
 * @param <J> the type of element being stored in the nodes (must be comparable)
 */
public class WeissBST<J extends Comparable<? super J>>
{

	//--------------------------------------------------------
	// CODE PROVIDED from WEISS
	//--------------------------------------------------------
	// Do NOT change the implementation - you should only edit 
	// in order to pass JavaDoc and style checking.
	//--------------------------------------------------------

	/**
	 * Basic node stored in unbalanced binary search trees
	 * Note that this class is not accessible outside
	 * of this class.
	 * @param <J> the type of element being stored in the nodes (must be comparable)
	 */
	private class BinaryNode<J>
	{
		/**
		 * constructor for the node.
		 * @param theElement the element being held in storage
		 */
		BinaryNode( J theElement )
		{
			element = theElement;
			left = right = null;
		}
		
		/**
		 * The data in the node.
		 */
		J element;
		
		/**
		 * left child.
		 */
		BinaryNode<J> left;
   	 	
   	 	/**
		 * Right child.
		 */
   	 	BinaryNode<J> right;
	}
	
	/**
	 * The tree root.
	 */
	private BinaryNode<J> root;



	/**
	 * Construct the tree.
	 */
	public WeissBST( )
	{
		root = null;
	}

	/**
	 * Insert into the tree.
	 * @param x the item to insert.
	 * @throws Exception if x is already present.
	 */
	public void insert( J x )
	{
		root = insert( x, root );
	}

	/**
	 * Remove minimum item from the tree.
	 * @throws Exception if tree is empty.
	 */
	public void removeMin( )
	{
		root = removeMin( root );
	}

	/**
	 * Find the smallest item in the tree.
	 * @return smallest item or null if empty.
	 */
	public J findMin( )
	{
		return elementAt( findMin( root ) );
	}


	/**
	 * Find an item in the tree.
	 * @param x the item to search for.
	 * @return the matching item or null if not found.
	 */
	public J find( J x )
	{
		return elementAt( find( x, root ) );
	}

	/**
	 * Make the tree logically empty.
	 */
	public void makeEmpty( )
	{
		root = null;
	}

	/**
	 * Test if the tree is logically empty.
	 * @return true if empty, false otherwise.
	 */
	public boolean isEmpty( )
	{
		return root == null;
	}

	/**
	 * Internal method to get element field.
	 * @param t the node.
	 * @return the element field or null if t is null.
	 */
	private J elementAt( BinaryNode<J> t )
	{
		return t == null ? null : t.element;
	}

	/**
	 * Internal method to insert into a subtree.
	 * @param x the item to insert.
	 * @param t the node that roots the tree.
	 * @return the new root.
	 * @throws Exception if x is already present.
	 */
	private BinaryNode<J> insert( J x, BinaryNode<J> t )
	{
		if( t == null )
			t = new BinaryNode<J>( x );
		else if( x.compareTo( t.element ) < 0 )
			t.left = insert( x, t.left );
		else if( x.compareTo( t.element ) > 0 )
			t.right = insert( x, t.right );
		else
			throw new IllegalArgumentException( "Duplicate Item: " + x.toString( ) );  // Duplicate
		return t;
	}


	/**
	 * Internal method to remove minimum item from a subtree.
	 * @param t the node that roots the tree.
	 * @return the new root.
	 * @throws Exception if t is empty.
	 */
	private BinaryNode<J> removeMin( BinaryNode<J> t )
	{
		if( t == null )
			throw new IllegalArgumentException( "Min Item Not Found");
		else if( t.left != null )
		{
			t.left = removeMin( t.left );
			return t;
		}
		else
			return t.right;
	}	

	/**
	 * Internal method to find the smallest item in a subtree.
	 * @param t the node that roots the tree.
	 * @return node containing the smallest item.
	 */
	private BinaryNode<J> findMin( BinaryNode<J> t )
	{
		if( t != null )
			while( t.left != null )
				t = t.left;

		return t;
	}


	/**
	 * Internal method to find an item in a subtree.
	 * @param x is item to search for.
	 * @param t the node that roots the tree.
	 * @return node containing the matched item.
	 */
	private BinaryNode<J> find( J x, BinaryNode<J> t )
	{
		while( t != null )
		{
			if( x.compareTo( t.element ) < 0 )
				t = t.left;
			else if( x.compareTo( t.element ) > 0 )
				t = t.right;
			else
				return t;
		}
		
		return null;
	}

	/**
	 * Remove from the tree..
	 * @param x the item to remove.
	 * @throws Exception if x is not found.
	 */
	public void remove( J x )
	{
		root = remove( x, root );
	}

	/**
	 * Internal method to remove from a subtree.
	 * @param x the item to remove.
	 * @param t the node that roots the tree.
	 * @return the new root.
	 * @throws Exception if x is not found.
	 */
	private BinaryNode<J> remove( J x, BinaryNode<J> t )
	{
		if( t == null )
			throw new IllegalArgumentException( "Item Not Found: " + x.toString( ) );
		if( x.compareTo( t.element ) < 0 )
			t.left = remove( x, t.left );
		else if( x.compareTo( t.element ) > 0 )
			t.right = remove( x, t.right );
		else if( t.left != null && t.right != null ) // Two children
		{
			t.element = findMax( t.left ).element;
			t.left = removeMax( t.left );
		}
		else
			t = ( t.left != null ) ? t.left : t.right;
		return t;
	}
	
	/**
	 * Gets the max value in the tree.
	 * @param t the starting node.
	 * @return BinaryNode the node that is the max.
	 */
	private BinaryNode<J> findMax( BinaryNode<J> t )
	{
		if( t != null )
			while( t.right != null )
				t = t.right;

		return t;
	}
	
	/**
	 * Removes the max value in the tree.
	 * @param t the starting node.
	 * @return BinaryNode the node that is removed.
	 */
	private BinaryNode<J> removeMax( BinaryNode<J> t )
	{
		if( t == null )
			throw new IllegalArgumentException( "Max Item Not Found");
		else if( t.right != null )
		{
			t.right = removeMax( t.right );
			return t;
		}
		else
			return t.left;
	}
	
	/**
	* report the number of nodes in tree.
	* @return int representing the number of nodes in the tree
	*/
	public int size()
	{
		if(isEmpty())
		{
			return 0;
		}
		
		return sizeRecursive(root);
	}
	
	/**
	* Recursive helper method for size function.
	* @param t the node being recursed through
	* @return int representing the number of nodes counted
	*/
	private int sizeRecursive(BinaryNode<J> t)
	{	
		int s = 0;
  		
		if(t != null)
		{	
			s = s + sizeRecursive(t.left);
			
			s = s + 1;
			
			s = s + sizeRecursive(t.right);
		}
		
		return s;
	}
	
	/**
	* Return a string representation of the tree follows IN-ORDER traversal to include all nodes.
	* @return String of values in the graph
	*/
	public String toString()
  	{
  		if(isEmpty())
		{
			return "";
		}
  		
		return toStringRecusive(root);
  	}
  	
  	/**
	* Recursive helper method for toString.
	* @param t the node being recursed through
	* @return String of values in the graph
	*/
  	private String toStringRecusive(BinaryNode<J> t)
  	{
  		String s = "";
  		
		if(t != null)
		{	
			s = s + toStringRecusive(t.left);
			
			s = s + t.element.toString() + " ";
			
			s = s + toStringRecusive(t.right);
		}
		
		return s;
  	}
  	
	/**
	* Return an array representation of all values following PRE-ORDER traversal.
	* @return LinkedList of all the values in the graph
	*/	
	public LinkedList<J> values()
	{
		if(isEmpty())
		{
			return new LinkedList<>();
		}
		
		return valuesRecusive(root);		
	}
	
	/**
	* Recursive helper method for values.
	* @param t the node being recursed through
	* @return LinkedList of values in the graph
	*/
	private LinkedList<J> valuesRecusive(BinaryNode<J> t)
  	{
		LinkedList<J> lst = new LinkedList<>();
		if(t != null)
		{
			lst.add(t.element);
			
			for(J a : valuesRecusive(t.left))
			{
				lst.add(a);
			}
			
			for(J a : valuesRecusive(t.right))
			{
				lst.add(a);
			}
		}
		return lst;
  	}

	/**
	 * testing code for this class.
	 * @param args a string array of command line arguements
	 */
	public static void main( String [ ] args )
	{
		WeissBST<Integer> t = new WeissBST<Integer>( );

		if (t.size()==0 && t.isEmpty() && t.find(310)==null){
			System.out.println("Yay 1");
		}
		
		t.insert(310);
		t.insert(112);
		t.insert(440);
		t.insert(330);
		t.insert(471);
		LinkedList<Integer> values = t.values();

		// Current tree:
		//			  310
		//           /   \
		//        112     440
		//                /  \
		//              330  471
		
		if (t.size()==5 && t.toString().equals("112 310 330 440 471 ") && !t.isEmpty()){
			System.out.println("Yay 2");
		}
		
		if (values.size()==5 && values.get(0)==310 && values.get(1)==112 &&
			values.get(2) == 440 && values.get(3)== 330 && values.get(4)== 471){
			System.out.println("Yay 3");
		}

		//remove
		t.remove(440);
		
		//check removal with predecessor replacement
		//tree expected:
		//
		//			  310
		//           /   \
		//        112     330
		//                  \
		//              	 471
		values = t.values();
		
		if (values.size() == 4 && values.get(2)==330 && values.get(3)==471){
			System.out.println("Yay 4");		
		}
		
		//System.out.print(t);
	
	}
	
}
