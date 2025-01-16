
/**
 * This class represent a single node in the list. 
 * It is generic of course and, because we want to be able to compare any two nodes with each other, it implements the Comparable interface. 
 * This is a functional interface which means that it has one method only.
 * 
 * @param data Holds the data of the node.
 * @param up The pointer to the node above.
 * @param down The pointer to the node below.
 * @param right The pointer to the node on the right.
 * @param left The pointer to the node on the left.
 */
public final class Node<T extends Comparable<T>> implements Comparable<Node<T>>
{
	private T data;
	private Node<T> up;
	private Node<T> down;
	private Node<T> right;
	private Node<T> left;
	
	/**
	 * The setter for the Value field.
	 * 
	 * @param value the value stored in the node.
	 */
	public void setValue(T value)
	{
		this.data = value;
	}
	
	/**
	 * The getter for the Value field.
	 * 
	 * @return data the value stored in the node.
	 */
	public T getValue()
	{
		return data;
	}
	
	/**
	 * The getter for the node above this node.
	 * 
	 * @return up.
	 */
	public Node<T> getUp()
	{
		return up;
	}
	
	/**
	 * The getter for the node below this node.
	 * 
	 * @return down.
	 */
	public Node<T> getDown()
	{
		return down;
	}
	
	/**
	 * The getter for the node to the right of this node.
	 * 
	 * @return right.
	 */
	public Node<T> getRight()
	{
		return right;
	}
	
	/**
	 * The getter for the node to the left of this node.
	 * 
	 * @return left.
	 */
	public Node<T> getLeft()
	{
		return left;
	}
	
	/**
	 * The setter for the node above of this node.
	 * 
	 * @param p the node that will be added above.
	 */
	public void setUp(Node<T> p)
	{
		up = p;
	}
	
	/**
	 * The setter for the node below of this node.
	 * 
	 * @param p the node that will be added below.
	 */
	public void setDown(Node<T> p)
	{
		down = p;
	}
	
	/**
	 * The setter for the node to the right of this node.
	 * 
	 * @param p the node that will be added to the right.
	 */
	public void setRight(Node<T> p)
	{
		right = p;
	}
	
	/**
	 * The setter for the node to the Left of this node.
	 * 
	 * @param p the node that will be added to the Left.
	 */
	public void setLeft(Node<T> p)
	{
		left = p;
	}
	
	/**
	 * The Constructor for the Node object.
	 */
	public Node()
	{
		data = null;
		up = null;
		down = null;
		right = null;
		left = null;
	}
	
	/**
	 * The overloaded Constructor for the Node object. This sets the value of the node.
	 * 
	 * @param value the value that will be stored in this node.
	 */
	public Node(T value)
	{
		data = value;
		up = null;
		down = null;
		right = null;
		left = null;
	}
	
	/**
	 * Compares the values stored in the node to another nodes value.
	 * 
	 * @param O the other node being compared.
	 */
	public int compareTo(Node<T> o) 
	{
		return data.compareTo(o.getValue());
	} 
}
