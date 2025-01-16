// TO DO: add your implementation and JavaDoc

public class DynGrid310<T> {

	//underlying 2-d array for storage -- you MUST use this for credit!
	//Do NOT change the name or type
	private DynArr310<DynArr310<T>> storage;	

	// ADD MORE PRIVATE MEMBERS HERE IF NEEDED!
	
	public DynGrid310(){
		// constructor
		// create an empty grid (no content)		
		// only use the parameterless constructor of DynArr310 to initialize 		
	
	}


	public int getNumRow() {
		// report number of rows with contents in the grid
		// Note: this might be different from the max number of rows 
		// 		 of the underlying storage.
		// O(1) 
		
		return -1; //default return, remove or change as needed
		
	}
	
	public int getNumCol() { 
		// report number of columns with contents in the grid
		// Note: similarly, this might be different from the max number of columns 
		// 		 of the underlying storage.
		// O(1) 

		return -1; //default return, remove or change as needed
	}
	
    public boolean isValidCell(int row, int col){
    	// check whether (row,col) corresponds to a cell with content
    	// return true if yes, false otherwise
    	//O(1)
    	
		return false; //default return, remove or change as needed
    }
    
	
	public T get(int row, int col){
		// report cell value at (row, col)

		// - Throw IndexOutOfBoundsException if any index is not valid
		// - Use this code to produce the correct error message for
		// the exception (do not use a different message):
		//	  "Index("+row+","+col+") out of bounds!"

		// O(1)

		return null; //default return, remove or change as needed
	}
	
	public T set(int row, int col, T value){
		// change cell value at (row, col) to be value, and return the old cell value
		
		// Use the exception (and error message) described in set()
		// for invalid indicies.
		
		// For valid indicies, if value is null, throw IllegalArgumentException. 
		// - Use this _exact_ error message for the exception 
		//  (quotes are not part of the message):
		//    "Null values not accepted!"

		// O(1)

		return null; //default return, remove or change as needed

	}

	
	public boolean addRow(int index, DynArr310<T> newRow){
		// insert newRow into the grid at index, shifting rows if needed
		// a new row can be appended 
		
		// return false if newRow can not be added correctly, e.g.
		// 	- invalid index
		//  - newRow is null or empty
		//	- the number of items in newRow does not match existing rows
		//
		// return true otherwise
		// 

		// O(R) 
		

		return false;//default return, remove or change as needed
		
	}
	
	public boolean addCol(int index, DynArr310<T> newCol){
		// insert newCol as a new column into the grid at index, shifting cols if needed
		// a new column can be appended
		
		// return false if newCol can be added correctly, e.g.
		// 	- invalid index
		//  - newCol is null or empty
		//	- the number of items in newCol does not match existing columns
		//
		// return true otherwise

		// O(CR) where R is the number of rows and C is the number of columns of the grid
		return false;//default return, remove or change as needed

	}
	
	public DynArr310<T> removeRow(int index){
		// remove and return a row at index, shift rows as needed to remove the gap		
		// return null for an invalid index
				
		// O(R) where R is the number of rows of the grid
		
		return null;//default return, remove or change as needed
	}

	public DynArr310<T> removeCol(int index){
		// remove and return a column at index, shift cols as needed to remove the gap
		// return null for an invalid index
		//
		// O(RC) where R is the number of rows and C is the number of columns 

		return null;//default return, remove or change as needed
		
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