
public class SudokuBoard {
	
	private int[][] board;
	
	public SudokuBoard()
	{
		board = new int[9][9];
	}
	
	public SudokuBoard(String textboard)
	{
		board = new int[9][9];
		
		String[] s = textboard.split(",");
		
		int indexer = 0;
		
		for(int x = 0;x < 9; ++x)
		{
			for(int y = 0;y < 9; ++y)
			{
				board[x][y] = Integer.parseInt(s[indexer]);
				indexer++;
			}
		}
	}
	
	public int[][] getBoard()
	{
		return board;
	}
	
	public int getNumber(int x, int y)
	{
		return board[x][y];
	}
	
	public int setNumber(int x, int y, int n)
	{
		return board[x][y] = n;
	}
	
	public int[] getRow(int x)
	{
		int[] r = new int[9];
		
		for(int y = 0;y < 9; ++y)
		{
			r[y] = board[x][y];
		}
		return r;
	}
	
	public int[] getCol(int y)
	{
		int[] r = new int[9];
		
		for(int x = 0;x < 9; ++x)
		{
			r[x] = board[x][y];
		}
		return r;
	}
	
	public int[] getSquare(int x, int y)
	{
		int[] r = new int[9];
		
		int startingXPos = 0;
		int startingYPos = 0;
		
		if(x==0 && y==0)
		{
			startingXPos = 0;
			startingYPos = 0;
		}
		if(x==1 && y==0)
		{
			startingXPos = 0;
			startingYPos = 3;
		}
		if(x==2 && y==0)
		{
			startingXPos = 0;
			startingYPos = 6;
		}
		if(x==0 && y==1)
		{
			startingXPos = 3;
			startingYPos = 0;
		}
		if(x==1 && y==1)
		{
			startingXPos = 3;
			startingYPos = 3;
		}
		if(x==2 && y==1)
		{
			startingXPos = 3;
			startingYPos = 6;
		}
		if(x==0 && y==2)
		{
			startingXPos = 6;
			startingYPos = 0;
		}
		if(x==1 && y==2)
		{
			startingXPos = 6;
			startingYPos = 3;
		}
		if(x==2 && y==2)
		{
			startingXPos = 6;
			startingYPos = 6;
		}
		
		int indexer = 0;
		
		for(int a = 0;a < 3; ++a)
		{
			for(int b = 0;b < 3; ++b)
			{
				r[indexer] = board[startingXPos+a][startingYPos+b];
				indexer++;
			}
		}
		
		return r;
	}
	
	public String toString()
	{
		String s = "";
		
		for(int x = 0;x < 9; ++x)
		{
			for(int y = 0;y < 9; ++y)
			{
				if(board[x][y] == 0)
				{
					s = s + "_";
				}
				else
				{
					s = s + board[x][y];
				}
				
				if(y==2 || y==5)
				{
					s = s + "|";
				}
				else
				{
					s = s + " ";
				}
			}
			if(x==2 || x==5)
			{
				s = s + "\n-----+-----+-----\n";
			}
			else
			{
				s = s + "\n";
			}
		}
		
		return s;
	}
}
