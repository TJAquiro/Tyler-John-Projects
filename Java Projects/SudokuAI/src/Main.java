
public class Main {

	public static void main(String[] args) 
	{
		SudokuBoard board = new SudokuBoard(
				  "0,2,0,5,0,6,0,1,0,"
				+ "6,0,3,1,7,9,0,0,0,"
				+ "0,1,0,3,0,0,0,0,0,"
				+ "0,0,1,0,0,2,3,4,0,"
				+ "3,4,9,0,1,0,0,2,6,"
				+ "2,0,6,4,0,7,8,0,0,"
				+ "0,0,0,6,5,8,0,0,0,"
				+ "5,0,8,7,4,3,0,6,0,"
				+ "7,6,0,0,0,1,0,0,0");
		
		System.out.println(board);
		System.out.println(board.getSquare(2, 1)[5]);
		
	}

}
