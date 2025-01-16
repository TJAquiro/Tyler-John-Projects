//TODO: None. No changes allowed.

/**
 * A class representing a single cell in the minesweeper game board.
 *
 * @author Y. Zhong
 */

public class Cell{

	/**
	 * Boolean flag to indicate whether there is a mine underneath.
	 */
	private boolean hasMine;

	/**
	 * Boolean flag to indicate whether the cell has been flagged.
	 */
	private boolean flagged;

	/**
	 * Boolean flag to indicate whether the cell has been clicked open.
	 */
	private boolean visible;

	/**
	 * The number of mines adjacent to the cell.
	 */
	private int nbrMineCount;
	
	
	/**
	 * Constructor. Initialize instance variables.
	 */
	public Cell(){
		hasMine = false;
		visible = false;
		flagged = false;
		nbrMineCount = -1; //if hasMine, count is always -1  
	}
	
	//setters and getters
	
	/**
	 * The method that places a mine at this cell.
	 */	
	public void setMine() { hasMine = true; }

	/**
	 * The method that removes a mine from this cell.
	 */	
	public void removeMine() {hasMine = false; }
	
	/**
	 * The method that reports whether this cell has a mine.
	 * @return true if it has a mine; false otherwise
	 */	
	public boolean hasMine(){ return hasMine;}
	
	/**
	 * The method that opens this cell.
	 */	   
	public void setVisible() { visible = true; }

	/**
	 * The method that hides this cell.
	 */	   
	public void setInvisible() { visible = false; }

	/**
	 * The method that reports whether this cell is hidden or has been exposed.
	 * @return true if cell is exposed (not hidden); false otherwise
	 */	   
	public boolean visible() { return visible; }
	
	
	/**
	 * The method that flags this cell.
	 */	
	public void setFlagged() { flagged = true; }

	/**
	 * The method that unflags this cell.
	 */	
	public void unFlagged() { flagged = false; }

	/**
	 * The method that reports whether this cell has been flagged.
	 * @return true if cell has been flagged; false otherwise
	 */		  
	public boolean isFlagged() { return flagged; }

	/**
	 * The method that reports the number of mines adjacent to this cell. 
	 * If the cell has a mine, it should report a special value -1.
	 * @return the number of mines adjacent to this cell. 
	 */		  
	public int getCount() { return nbrMineCount; }
	
	
	/**
	 * The method that sets the number of mines adjacent to this cell. 
	 * It assumes that the caller of this method will set -1 for a cell with a mine 
	 * underneath it (no further checking).
	 * @param count the number of mines adjacent to this cell. 
	 */		  
	public void setCount(int count) {
		if (count<-1 || count>8){
			throw new IllegalArgumentException("Incorrect count value: " + count + "!");
		}
		nbrMineCount = count; 
	}


	/**
	 * The method that returns a String representation of this cell. 
	 * This can help you to print out the cells from board for debugging purpose.
	 * @return a String representation of this cell.
	 */		  
	@Override
	public String toString(){
		if (flagged) return "F";
		if (visible){
			if (hasMine) return "X";
			else if (nbrMineCount==0)
					return " ";
			else
					return ""+nbrMineCount;
		}
		else
			return "?";
		
	}

	/**
	 * The method that returns a detailed String representation of this cell. 
	 * This can help you to print out the cells from board for debugging purpose.
	 * @return a detailed String representation of this cell.
	 */		  
	
	public String toStringDebug(){
		String visibleS = visible? ",v":"";
		String flaggedS = flagged? "f":"";
		if (hasMine) 
			return "X,"+flaggedS +visibleS;
		else 
			return " ,"+flaggedS + nbrMineCount+visibleS;
	}
	
	
	 
}