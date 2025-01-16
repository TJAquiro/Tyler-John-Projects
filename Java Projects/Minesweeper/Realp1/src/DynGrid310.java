public class DynGrid310<T> {

	private DynArr310<DynArr310<T>> storage;	

	/**
	 * constructor
	 * creates a DynGrid310 object
	 */	
	public DynGrid310()
	{
		this.storage = new DynArr310<>();
	}

	/**
	 * The method that reports the number of rows with contents in the grid
	 * @return integer value for number of rows
	 */	
	public int getNumRow() 
	{
		if (getNumCol() == 0)
		{
			return 0;
		}
		else
		{
			return storage.size();
		}
	}
	
	/**
	 * The method that reports the number of columns with contents in the grid
	 * @return integer value for number of columns
	 */	
	public int getNumCol()
	{ 	
		if (storage.size() == 0)
		{
			return 0;
		}
		return storage.get(0).size();
	}
	
	/**
	 * The method that checks whether (row,col) corresponds to a cell with content
	 * @return return true if yes, false otherwise
	 */	
    public boolean isValidCell(int row, int col)
    {
    	if (row < 0 || row > getNumRow() || col < 0 || col >= getNumCol() || row >= getNumRow())
    	{
            return false;
        }
    	else
    	{
    		return true;
    	}
	}
    
    /**
	 * The method that reports cell value at (row, col)
	 * @throws IndexOutOfBoundsException if any index is not valid
	 * @return object T value at (row, col)
	 */	
	public T get(int row, int col)
	{
		if (!(isValidCell(row, col)))
		{
			throw new IndexOutOfBoundsException("Index(" + row + "," + col + ") out of bounds!");
        }
		else
		{	
			return storage.get(row).get(col);
		}
	}
	
	/**
	 * The method that reports cell value at (row, col)
	 * @throws IndexOutOfBoundsException if any index is not valid
	 * @throws IllegalArgumentException for valid indicies, if value is null
	 * @return object T value, the old cell value
	 */	
	public T set(int row, int col, T value)
	{
		if(row < 0 || row > storage.capacity() || col < 0 || col > storage.get(row).capacity())
		{
			throw new IndexOutOfBoundsException("Index("+row+","+col+") out of bounds!");
		}
		if (value == null)
		{
			throw new IllegalArgumentException("Null values not accepted!");
		}
		
		T returnval = storage.get(row).get(col);
		storage.get(row).set(col, value);
		return returnval;
	}
	
	/**
	 * The method that inserts newRow into the grid at index, shifting rows if needed
	 * @return false if newRow can not be added correctly,returns true otherwise
	 */	
	public boolean addRow(int index, DynArr310<T> newRow)
	{
		if (index < 0 || index > getNumRow() || newRow == null || (getNumCol() != 0 && newRow.size() != getNumCol()))
		{
            return false;
        }
		else
		{
			storage.insert(index, newRow);
			return true;
		}		
	}
	
	/**
	 * The method that inserts newCol as a new column into the grid at index, shifting cols if needed
	 * @return false if newCol can be added correctly, return true otherwise
	 */	
	public boolean addCol(int index, DynArr310<T> newCol)
	{
		if (index < 0 || index > getNumCol() || newCol == null || newCol.size() != getNumRow())
		{
			return false;
		}
		else
		{
			for (int x = 0; x < getNumRow(); x++) 
			{
				storage.get(x).insert(index, newCol.get(x));
			}
			return true;
		}
	}
	
	/**
	 * The method that removes and return a row at index, shift rows as needed to remove the gap	
	 * @return return null for an invalid index, otherwise return a the row at index
	 */	
	public DynArr310<T> removeRow(int index)
	{
		if (index < 0 || index >= getNumRow())
		{
            return null;
        }
		return storage.remove(index);
	}
	
	/**
	 * The method that removes and returns a column at index, shift cols as needed to remove the gap	
	 * @return return null for an invalid index, otherwise return a the column at index
	 */
	public DynArr310<T> removeCol(int index)
	{
		if (index < 0 || index >= getNumCol()) 
		{
			return null;
		}

		DynArr310<T> returnval = new DynArr310<>();
        
        for (int i = 0; i < storage.size(); i++) 
        {        	
        	returnval.add(storage.get(i).remove(index));
        }        
        return returnval;
	}
	

	//******************************************************
	//*******     BELOW THIS LINE IS PROVIDED code   *******
	//*******             Do NOT edit code!          *******
	//*******		   Remember to add JavaDoc		 *******
	//******************************************************
	
	@Override
	public String toString(){
		if(getNumRow() == 0 || getNumCol() == 0 ){ return "empty board"; }
    	StringBuilder sb = new StringBuilder();
    	for(int i=0; i<getNumRow(); i++){
            sb.append("|");
    		for (int j=0;j<getNumCol(); j++){
      			sb.append(get(i,j).toString());
      		    sb.append("|");
      		}
      		sb.append("\n");
    	}
    	return sb.toString().trim();

	}

	//******************************************************
		//*******     BELOW THIS LINE IS TESTING CODE    *******
		//*******      Edit it as much as you'd like!    *******
		//*******		Remember to add JavaDoc			 *******
		//******************************************************

		public static void main(String[] args){
			//These are _sample_ tests. If you're seeing all the "yays" that's
			//an excellend first step! But it does NOT guarantee your code is 100%
			//working... You may edit this as much as you want, so you can add
			//own tests here, modify these tests, or whatever you need!

			//create a grid of strings
			DynGrid310<String> sgrid = new DynGrid310<>();
			
			//prepare one row to add
			DynArr310<String> srow = new DynArr310<>();
			srow.add("English");
			srow.add("Spanish");
			srow.add("German");
			
			//addRow and checking
			if (sgrid.getNumRow() == 0 && sgrid.getNumCol() == 0 && !sgrid.addRow(1,srow)
				&& sgrid.addRow(0,srow) && sgrid.getNumRow() == 1 && sgrid.getNumCol() == 3){
				System.out.println("Yay 1");
			}
		
			
			//get, set, isValidCell
			if (sgrid.get(0,0).equals("English") && sgrid.set(0,1,"Espano").equals("Spanish") 
				&& sgrid.get(0,1).equals("Espano") && sgrid.isValidCell(0,0) 
				&& !sgrid.isValidCell(-1,0) && !sgrid.isValidCell(3,2)) {
				System.out.println("Yay 2");
			}

			//a grid of integers
			DynGrid310<Integer> igrid = new DynGrid310<Integer>();
			boolean ok = true;

			//add some rows (and implicitly some columns)
			for (int i=0; i<3; i++){
				DynArr310<Integer> irow = new DynArr310<>();
				irow.add((i+1) * 10);
				irow.add((i+1) * 11);
	        
				ok = ok && igrid.addRow(igrid.getNumRow(),irow);
			}
			
			//toString
			//System.out.println(igrid);
			if (ok && igrid.toString().equals("|10|11|\n|20|22|\n|30|33|")){
				System.out.println("Yay 3");		
			}
					
			//prepare a column 
			DynArr310<Integer> icol = new DynArr310<>();
			
			//add two rows
			icol.add(-10);
			icol.add(-20);
			
			//attempt to add, should fail
			ok = igrid.addCol(1,icol);
			
			//expand column to three rows
			icol.add(-30);
			
			//addCol and checking
			if (!ok && !igrid.addCol(1,null) && igrid.addCol(1,icol) && 
				igrid.getNumRow() == 3 && igrid.getNumCol() == 3){
				System.out.println("Yay 4");		
			}
			
			//System.out.println(igrid);
			
			//removeRow
			if (igrid.removeRow(5) == null && 
				igrid.removeRow(1).toString().equals("[20, -20, 22]") && 
				igrid.getNumRow() == 2 && igrid.getNumCol() == 3 ){
				System.out.println("Yay 5");	
			}
			
			
			//removeCol
			if (igrid.removeCol(0).toString().equals("[10, 30]") && 
				igrid.removeCol(1).toString().equals("[11, 33]") &&
				igrid.removeCol(0).toString().equals("[-10, -30]") &&
				igrid.getNumRow() == 0 && igrid.getNumCol() == 0 ){
				System.out.println("Yay 6");	
			}
		}
		
	}