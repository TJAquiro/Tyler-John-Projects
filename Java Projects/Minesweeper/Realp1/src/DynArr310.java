// TO DO: add your implementation and JavaDoc

public class DynArr310<T> {

	private T[] storage;
	private static final int MINCAP = 2;
	private int numElements;
	
	/**
	 * constructor
	 * initial capacity of the array should be MINCAP
	 */	
	@SuppressWarnings("unchecked")
	public DynArr310(){
		numElements = 0;
		this.storage = (T[]) new Object[MINCAP];
		
	}
	
	/**
	 * constructor
	 * initial capacity of the array should be initCap, 
	 * initCap can't be lower than MINCAP
	 * @throws IllegalArgumentException if initCap is smaller than MINCAP
	 */	
	@SuppressWarnings("unchecked")
	public DynArr310(int initCap){
		if (initCap < MINCAP)
		{
			throw new IllegalArgumentException("Capacity must be at least 2!");
		}
		else
		{
			this.storage = (T[]) new Object[initCap];
			numElements = 0;
		}		
	}
	
	
	/**
	 * The method that returns the current number of elements
	 * @return numElements
	 */	
	public int size() 
	{	
		return numElements;
	}  	
	
	/**
	 * The method that returns the max number of elements
	 * @return numElements
	 */	
	public int capacity() 
	{ 
		return this.storage.length;
	} 
	
	/**
	 * The method that replaces the item at the given index to be the given value.
	 * @throws IndexOutOfBoundsException if index is not valid
	 * @throws IllegalArgumentException if value is null. 
	 * @return Returns the old item at that index.
	 */	
	public T set(int index, T value) {
		
		if (index < 0 || index > capacity())
		{
			throw new IndexOutOfBoundsException("Index: " + index + " out of bounds!");
		}
		else if (value == null)
		{
			throw new IllegalArgumentException("Null values not accepted!");
		}
		else
		{
			if (storage[index] == null)
			{
				numElements++;
			}
			
			T returnval = storage[index];
			storage[index] = value;
			return returnval;
		}
	}
	
	/**
	 * The method that returns the item at the given index
	 * @throws IndexOutOfBoundsException if index is not valid
	 * @return Returns the item at that index
	 */	
	public T get(int index){
		
		if (index < 0 || index > numElements) 
		{
            throw new IndexOutOfBoundsException("Index: " + index + " out of bounds!");
        }
		else
		{
			return storage[index];
		}
	}
	
	/**
	 * The method that appends an element to the end of the storage.
	 * Doubles the capacity if no space available.
	 * @throws IllegalArgumentException if value is null. 
	 */
	@SuppressWarnings("unchecked")
	public void add(T value){
		if (value.equals(null))
		{
			throw new IllegalArgumentException("Null values not accepted!");
		}
		if (numElements >= storage.length)
		{
			T[] newStorage = (T[]) new Object[storage.length * 2];
			for(int x = 0;x < storage.length; ++x)
			{
				newStorage[x] = storage[x];
			}
			storage = newStorage;
		}
		storage[numElements] = value;
		numElements++;
	}
	
	/**
	 * The method that inserts the given value at the given index and shift elements if needed. 
	 * @throws IndexOutOfBoundsException if index is not valid
	 * @throws IllegalArgumentException if value is null. 
	 */
	@SuppressWarnings("unchecked")
	public void insert(int index, T value){
				
		if (value == null)
		{
			throw new IllegalArgumentException("Null values not accepted!");
		}
		if (index < 0 || index > numElements)
		{
			throw new IndexOutOfBoundsException("Index: " + index + " out of bounds!");
		}	
		if (numElements == storage.length)
		{
			T[] newStorage = (T[]) new Object[storage.length * 2];

			for (int x = 0; x < index; x++)
			{
				newStorage[x] = storage[x];
			}
			
			newStorage[index] = value;
            
			for (int y = index; y < numElements; y++)
			{
				newStorage[y + 1] = storage[y];
			}
			
			storage = newStorage;
			numElements++;
		}
		else 
		{
			for (int z = numElements; z > index; z--)
			{
				storage[z] = storage[z - 1];
			}
			storage[index] = value;
			numElements++;
		}
	}
	
	/**
	 * The method that removes and return the element at the given index. 
	 * Shift elements to ensure no gap. Throw an exception when there is an invalid
	 * If the number of elements after removal falls below or at 1/3 of the capacity, 
	 * halve capacity (rounding down) of the storage. 
	 * However, capacity will NOT go below MINCAP.
	 * @throws IndexOutOfBoundsException if index is not valid
	 * @return Returns the item removed
	 */	
	@SuppressWarnings("unchecked")
	public T remove(int index){
		if (index < 0 || index > capacity())
		{
			throw new IndexOutOfBoundsException("Index: " + index + " out of bounds!");
		}
		
		T returnval = storage[index];
		numElements--;
		
		if (numElements <= capacity() * 1/3 && ((capacity() / 2) >= MINCAP))
		{
			T[] newStorage = (T[]) new Object[capacity() / 2];
			int valueremoved = 0;
			
			for(int x = 0;x < newStorage.length; ++x)
			{
				if(x == index)
				{
					newStorage[x] = storage[x+1];
					valueremoved++;
				}
				else
				{
					newStorage[x] = storage[x + valueremoved];
				}
			}
			storage = newStorage;
		}	
		else
		{
			int valueremoved = 0;
			
			for(int x = 0;x < storage.length-1; ++x)
			{
				if(x == index)
				{
					valueremoved++;
				}
				storage[x] = storage[x+valueremoved];
			}
		}
		return returnval;			
	}
	
	//******************************************************
	//*******     BELOW THIS LINE IS PROVIDED code   *******
	//*******             Do NOT edit code!          *******
	//*******		   Remember to add JavaDoc		 *******
	//******************************************************

	@Override
	public String toString() {
		//This method is provided. Add JavaDoc and comments.
		
		StringBuilder s = new StringBuilder("[");
		for (int i = 0; i < size(); i++) {
			s.append(get(i));
			if (i<size()-1)
				s.append(", ");
		}
		s.append("]");
		return s.toString().trim();
		
	}
	
	//******************************************************
	//*******     BELOW THIS LINE IS TESTING CODE    *******
	//*******      Edit it as much as you'd like!    *******
	//*******		Remember to add JavaDoc			 *******
	//******************************************************
	

	public String toStringDebug() {
		//This method is provided for debugging purposes
		//(use/modify as much as you'd like), it just prints
		//out the DynArr310 details for easy viewing.
		StringBuilder s = new StringBuilder("DynArr310 with " + size()
			+ " items and a capacity of " + capacity() + ":");
		for (int i = 0; i < size(); i++) {
			s.append("\n  ["+i+"]: " + get(i));
		}
		return s.toString().trim();
		
	}

	
	public static void main (String args[]){
		//These are _sample_ tests. If you're seeing all the "yays" that's
		//an excellent first step! But it does NOT guarantee your code is 100%
		//working... You may edit this as much as you want, so you can add
		//own tests here, modify these tests, or whatever you need!

		//create a DynArr310 of integers
		DynArr310<Integer> ida = new DynArr310<>();
		if ((ida.size() == 0) && (ida.capacity() == 2)){
			System.out.println("Yay 1");
		}

		//add some numbers at the end
		for (int i=0; i<3; i++)
			ida.add(i*5);

		//uncomment to check details
		//System.out.println(ida);
		
		//checking dynamic array details
		if (ida.size() == 3 && ida.get(2) == 10 && ida.capacity() == 4){
			System.out.println("Yay 2");
		}
		
		//insert, set, get
		ida.insert(1,-10);
				
		ida.insert(4,100);
		/*
		System.out.println(ida);
		System.out.println(ida.set(1,-20));
		System.out.println(ida.size());
		System.out.println(ida.get(2));
		System.out.println(ida.capacity());
		*/
		if (ida.set(1,-20) == -10 && ida.get(2) == 5 
				&& ida.size() == 5 && ida.capacity() == 8 )
		{
			System.out.println("Yay 3");
		}
		
		
		//create a DynArr310 of strings
		DynArr310<String> letters = new DynArr310<>(6);
		
		//insert some strings
		letters.insert(0,"c");
		letters.insert(0,"a");
		letters.insert(1,"b");
		letters.insert(3,"z");
		
		//get, toString()
		if (letters.get(0).equals("a") && letters.toString().equals("[a, b, c, z]")){
			System.out.println("Yay 4");
		}
		
		//remove
		if (letters.remove(0).equals("a") && letters.remove(1).equals("c") &&
			letters.get(1).equals("z") && letters.size()==2 && letters.capacity()==3){
			System.out.println("Yay 5");			
		}

		//exception checking
		try{
			letters.set(-1,null);
		}
		catch (IndexOutOfBoundsException ex){
			if (ex.getMessage().equals("Index: -1 out of bounds!")){
				System.out.println("Yay 6");			
			}
		}
		
	}
        

}