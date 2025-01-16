//TODO: None!

//This class implements java.util.Set interface. 
//Check Java API of Set for description of methods implemented.

import java.util.Collection;
import java.util.Set;
import java.util.Iterator;

/**
 * Implements a set for Comparable elements.
 * 
 * @param <E> the type of elements maintained by this set
 * @author Y. Zhong
 */
class Set310<E extends Comparable<? super E>> implements Set<E> {

	/**
	 *  Internal storage of values in set using a binary search tree.
	 */
	private WeissBST<E> storage = new WeissBST<>();
	
	/**
	 *  {@inheritDoc}
	 */
	public boolean add(E e) {		
		if(e == null) throw new NullPointerException();
		
		if (storage.find(e)!=null)
			return false;
			
		try{
			storage.insert(e);
		}catch (IllegalArgumentException ex){
			return false; //should not arrive here since we have checked find(), but ...
		}
		return true;
		
	}
	
	/**
	 *  {@inheritDoc}
	 */
	public boolean addAll(Collection<? extends E> c) {
		boolean changedSomething = false;
		
		for(E e : c) {
			if(e != null) {
				changedSomething = add(e) || changedSomething;
			}
		}
		
		return changedSomething;
	}

	/**
	 *  {@inheritDoc}
	 */
	public void clear() {
		storage.makeEmpty();
	}

	/**
	 *  {@inheritDoc}
	 */
	@SuppressWarnings("unchecked")
	public boolean contains(Object o) {

		return storage.find((E)o) !=null;
	
	}

	/**
	 *  {@inheritDoc}
	 */
	public boolean isEmpty() {
		return size() == 0;
	}

	/**
	 *  {@inheritDoc}
	 */
	@SuppressWarnings("unchecked")
	public boolean remove(Object o) {
		if (o==null || storage.find((E)o)==null)
			return false;
			
		try{
			storage.remove((E)o);
		}catch (IllegalArgumentException ex){
			return false; //should not arrive here since we have checked find(), but ...
		}
		return true;
		
	}

	/**
	 *  {@inheritDoc}
	 */
	public int size() {
		return storage.size();
	}

	
	/**
	 *  {@inheritDoc}
	 */
	public Object[] toArray() {
		Object[] ret = new Object[size()];
		int i=0;
		for (E value: storage.values()){
			ret[i++] = value;
		}
		return ret;
	}
	
	
	/**
	 *  {@inheritDoc}
	 */
	public String toString(){
		return storage.toString();
	}

	/**
	 *  {@inheritDoc}
	 */
	public Iterator<E> iterator() {
		return storage.values().iterator();
	}

	
	/**
	* Operation not supported: guaranteed to throw an exception.
	*
	* {@inheritDoc}
	*/
	public boolean removeAll(Collection<?> c) {
		throw new UnsupportedOperationException();
	}

	/**
	* Operation not supported: guaranteed to throw an exception.
	*
	* {@inheritDoc}
	*/
	public boolean retainAll(Collection<?> c) {
		throw new UnsupportedOperationException();
	}

	/**
	* Operation not supported: guaranteed to throw an exception.
	*
	* {@inheritDoc}
	*/
	public <E> E[] toArray(E[] a) {
		throw new UnsupportedOperationException();
	}

	/**
	* Operation not supported: guaranteed to throw an exception.
	*
	* {@inheritDoc}
	*/
	public boolean containsAll(Collection<?> c) {
		throw new UnsupportedOperationException();
	}
	
	//--------------------------------------------------------
	// testing code goes here... edit this as much as you want!
	//--------------------------------------------------------
	
	/**
	* Main method for you to test more of your BST class.
	*
	* @param args not used
	*/	
	public static void main(String[] args) {
		Set310<Integer> set = new Set310<>();
		
		//addition, size
		if(set.add(1) && set.add(2) && set.add(-51) && !set.add(1) && set.size() == 3) {
			System.out.println("Yay 1");
		}
		
		//contains, remove
		if(set.contains(1) && set.remove(1) && !set.remove(1) && !set.contains(1) && 
			set.size() == 2) {
			System.out.println("Yay 2");
		}
		
		//clear, addAll
		set.clear();
		Set310<Integer> set2 = new Set310<>();
		for(int i = -100; i < 100; i += 17) set2.add(i);
		
		if(set.size() == 0 && set.addAll(set2) && set.size() == 12) {
			System.out.println("Yay 3");
		}
		
		//iterator
		for (Integer num: set){
			System.out.print(num+" ");
		}
		//expected print:
		// -100 -83 -66 -49 -32 -15 2 19 36 53 70 87 
		
		System.out.println();
	}
	
	
}