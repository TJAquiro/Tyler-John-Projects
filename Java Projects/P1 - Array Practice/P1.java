import java.util.Scanner;

class P1 
{
	
	//=======================================================================================================================================================================================
	//=====(Problem 1)=======================================================================================================================================================================
	//=======================================================================================================================================================================================
	
	public static int stringValue(String word)
    {
		String storedLetter = " ";
		int wordTotal = 0;
		String currentletter;
		String nums = "1234567890";
		int currentMax = 0;
		
		for (int i = 0; i < word.length(); i++)
		{
			currentletter = word.substring(i,i+1);
			if (!(nums.contains(currentletter)))
			{
				if (!(currentletter.contains(" ")))
				{
					if (currentletter.contains(storedLetter))
					{
						storedLetter = " ";
					}
					else
					{
						wordTotal = wordTotal + (int)word.charAt(i);
						storedLetter = word.substring(i,i+1);
						if ((int)word.charAt(i) > currentMax)
						{
							currentMax = (int)word.charAt(i);
						}
					}
				}
				else
				{
					storedLetter = " ";
				}
			}
			else
			{
				storedLetter = " ";
			}
		}
		
		for (int i = 0; i < word.length(); i++)
		{
			currentletter = word.substring(i,i+1);
			if ((nums.contains(currentletter)))
			{
				wordTotal = wordTotal + ((int)word.charAt(i) * currentMax);
			}

		}
		
		
		return wordTotal;
	}
	//=======================================================================================================================================================================================
	//=====(Problem 2)=======================================================================================================================================================================
	//=======================================================================================================================================================================================
	
	public static double expValue(int x, double precision)
	{
		double returnV = 1;
		double xFactorial = (double)x;
		double bottomFactorial = 1.0;
		double multiplyer = 1.0;
		double lastV = (precision * -1);
		int i = 2;
		
		if (xFactorial == 0)
		{
			return(1.0);
		}
		
		while ((returnV - lastV) > precision || ((returnV - lastV)*-1) > precision)
		{
			lastV = returnV;
			returnV = returnV + (xFactorial / bottomFactorial);
			xFactorial = xFactorial * (double)x;
			bottomFactorial = bottomFactorial * i;
			++i;
		}
		return(returnV);
		
	}
	
	//=======================================================================================================================================================================================
	//=====(Problem 3)=======================================================================================================================================================================
	//=======================================================================================================================================================================================
	
	public static int mirrorNum(int num)
	{
		if ((num < 10  && num >= 0) || ((num > -10  && num <= 0)))
		{
			return(num);
		}
		int newNum;
		if (num < 0)
		{
			newNum = num * -1;
		}
		else
			newNum = num;
		int returnNum = 0;
		int modmultiplyer = 10;
		double returnToOnesPlaceMultiplyer = 1;
		int gotnum;
		int stopperr = 0;
		
		
		while (modmultiplyer * .1 < newNum)
		{
			if (newNum == modmultiplyer)
			{
				gotnum = 1;
			}
			else
				gotnum = ((int)((newNum % modmultiplyer)*returnToOnesPlaceMultiplyer));
			
			modmultiplyer = modmultiplyer * 10;
			returnToOnesPlaceMultiplyer = returnToOnesPlaceMultiplyer * .1;
			
			if (gotnum < 0)
			{
				gotnum = gotnum * -1;
			}
			
			returnNum = returnNum * 10 + gotnum;
		}
		
		if (num < 0)
		{
			returnNum = returnNum * -1;
		}
		return returnNum;
		
	}
	
	//=======================================================================================================================================================================================
	//=====(Problem 4)=======================================================================================================================================================================
	//=======================================================================================================================================================================================
	
	public static int exponentSolver(int number1, int powerOf)
	{
		int returnNum = 1;
		for(int x = 1; x <= powerOf; ++x)
		{
			returnNum = returnNum * number1;
		}
		return returnNum;
	}
	
	public static boolean raisedNum(long num)
	{
		// long data types can be numbers between -2,147,483,647 and 2,147,483,647
		// 2^31 is 2,147,483,648 so the program will never need to check numbers beyond 2^31
		for(int x = 2; x <= 31; ++x)
		{
			for(int y = 2; y <= 31; ++y)
			{
				if ((exponentSolver(x, y) + exponentSolver(y, x)) == num)
				{
					return true;
				}
				else if ((exponentSolver(x, y) + exponentSolver(y, x)) > num)
				{
					break;
				}
			}
		}
		return false;
	}
	
	//=======================================================================================================================================================================================
	//=====(Problem 5)=======================================================================================================================================================================
	//=======================================================================================================================================================================================
	
	public static int[][] getarray(int[][] array, int square_Size1, int topS_Index, int topE_Index, int sideS_Index, int sideE_Index)
	{
		int[][] outputarray = new int [square_Size1+1][square_Size1+1];
		
		int indexerX = 0;
		int indexerY = 0;
		
		for(int tops = topS_Index;tops <= topE_Index; ++tops)
		{
			for(int sides = sideS_Index;sides <= sideE_Index; ++sides)
			{
				outputarray[indexerY][indexerX] = array [sides][tops];
				++indexerY;
			}
			indexerY = 0;
			++indexerX;
		}
		
		return outputarray;
		
	}
	
	public static int getarraysum(int[][] array)
	{
		int outputsum = 0;
		
		for(int x = 0;x < array.length; ++x)
		{
			for(int y = 0;y < array[x].length; ++y)
			{
				outputsum = array[x][y] + outputsum;
			}
		}
		
		return outputsum;
		
	}
	
	
	public static int[][] smallestSubarray(int[][] array, int sum)
	{
		int top_Start_index = 0;
		int top_End_index = 0;
		int side_Start_index = 0;
		int side_End_index = 0;
		int square_Size = 1;
		int[][] testedArray = new int[square_Size+1][square_Size+1];
		int longerEdge = 0;
		int arraySum = 0;
		int maxSum = (sum - 1);
		int[][] returnArray = new int[square_Size+1][square_Size+1];
		boolean maxFound = false;
		
		
		//finds longer edge
		
		if (array.length > array[0].length)
			longerEdge = array.length;
		else
			longerEdge = array[0].length;
			
		//outputs square ranges
		
		for (square_Size = 1; square_Size <= longerEdge; ++square_Size)
		{
			for(int outerlist = 0;outerlist < array.length; ++outerlist)
			{
				side_Start_index = outerlist;
				side_End_index = outerlist + square_Size;
				
				if (side_End_index >= array.length)
				{
					break;
				}
				else
				{
					for(int innerlist = 0;innerlist < array[outerlist].length; ++innerlist)
					{
						top_Start_index = innerlist;
						top_End_index = innerlist + square_Size;
					
						if (top_End_index >= array[outerlist].length)
						{
							break;
						}
						else
						{
							testedArray = new int[square_Size+1][square_Size+1];
							testedArray = getarray(array, square_Size, top_Start_index, top_End_index, side_Start_index, side_End_index);
							arraySum = getarraysum(testedArray);
							
							if(arraySum >= sum && arraySum >= maxSum)
							{
								returnArray = new int[square_Size+1][square_Size+1];
								returnArray = testedArray;
								maxSum = arraySum;
								maxFound = true;
							}
							
							
						}
					}
				}
			}
			
			if (maxFound)
			{
				break;
			}
			
		}
		return returnArray;
	}
	
	
	//=======================================================================================================================================================================================
	//=====(Problem 6)=======================================================================================================================================================================
	//=======================================================================================================================================================================================
	
	
	public static void replaceElement(int[][] array, int elem, int[] newElem)
	{		
		int[][] arrayClone = new int[array.length][];
		//creates a deep copy of array
		for(int x = 0;x < array.length; ++x)
		{
			arrayClone[x] = new int[array[x].length];
			for(int y = 0;y < array[x].length; ++y)
			{
				arrayClone[x][y] = array[x][y];
			}
		}
		
		int elemCounter = 0;
		int indexCounter = 0;
		int originalIndexer = 0; //remember to reset
		
		//counts how many occurances of elem in original array
		for(int arrayOuterlist = 0;arrayOuterlist < array.length; ++arrayOuterlist)
		{
			for(int arrayInnerlist = 0;arrayInnerlist < array[arrayOuterlist].length; ++arrayInnerlist)
			{
				if (arrayClone[arrayOuterlist][arrayInnerlist] == elem)
				{
					++elemCounter;
				}
			}
			
			//adjusts size of original array
			
			int setSize = (arrayClone[arrayOuterlist].length + (elemCounter * (newElem.length - 1)));
			array[arrayOuterlist] = new int[setSize];
			elemCounter = 0;
			setSize = 0;
			
			//reads values in arrayClone if elem is found add each element of newElem into original array
			
			for(int indexer = 0;indexer < (array[arrayOuterlist].length); ++indexer)
			{
				if (arrayClone[arrayOuterlist][originalIndexer] == elem)
				{
					for(int newElemIndex = 0;newElemIndex < newElem.length; ++newElemIndex)
					{	
						if (newElemIndex > 0)
						{
							array[arrayOuterlist][indexer] = newElem[newElemIndex];
							++indexer;
						}
						else
						{
							array[arrayOuterlist][indexer] = newElem[newElemIndex];
							++indexer;
						}
					}
				++originalIndexer;
				--indexer;
				}
				else
				{
					array[arrayOuterlist][indexer] = arrayClone[arrayOuterlist][originalIndexer];
					++originalIndexer;
				}
			}
			originalIndexer = 0;
			indexCounter = 0;
			elemCounter = 0;
			
		}
		
		if (newElem.length == 0)
		{
			array = arrayClone;
		}
		
	}
	
	//=======================================================================================================================================================================================
	//=====(Problem 7)=======================================================================================================================================================================
	//=======================================================================================================================================================================================
	
    
    public static int[] appendNum(int[] array, int num)
	{
		int[] returnArray = new int[(array.length) + 1];
		
		for(int x = 0;x < array.length; ++x)
		{
			returnArray[x] = array[x];
		}
		returnArray[array.length] = num;
		
		return returnArray;
		
	}
	
	
	public static int[][] appendArray(int[][] array, int[] appendingArray)
	{
		
		int[][] returnedArray = new int[array.length + 1][];
		
		for(int x = 0;x < array.length; ++x)
		{
			returnedArray[x] = array[x];
		}
		returnedArray[array.length] = appendingArray;
		
		return returnedArray;
	}
	
	
	public static int[][] removeDuplicates(int[][] array)
	{
		int[][] arrayCopy = array;
		int[][] outputArray = {};
		int lastnum = array[0][0];
		int[] arrayToBeAdded = {};
		
		for(int outterlist = 0;outterlist < array.length; ++outterlist)
		{
			for(int innerlist = 0;innerlist < array[outterlist].length; ++innerlist)
			{
				if ((lastnum != array[outterlist][innerlist]) || (outterlist == 0 && innerlist ==0))
				{
					arrayToBeAdded = appendNum(arrayToBeAdded, array[outterlist][innerlist]);
				}
				lastnum = array[outterlist][innerlist];
			}
			
			if(arrayToBeAdded.length > 0)
			{
				outputArray = appendArray(outputArray, arrayToBeAdded);
			}
			arrayToBeAdded = new int[] {};
		}
		return outputArray;
	}
	
	
	//=======================================================================================================================================================================================
	//=====(Problem 8)=======================================================================================================================================================================
	//=======================================================================================================================================================================================
	
	public static int[] GetouterRing(int topStart, int topEnd, int sideStart, int sideEnd, int[][] array, int[] nublist, int indexx)
	{	
		for (int top = topStart; top < topEnd; ++top)
		{
			nublist[indexx] = array[sideStart][top];
			++indexx;
		}
		for (int right = sideStart; right < sideEnd; ++right)
		{
			nublist[indexx] = array[right][topEnd];
			++indexx;
		}
		for (int bottom = topEnd; bottom > topStart; --bottom)
		{
			nublist[indexx] = array[sideEnd][bottom];
			++indexx;
			if (topStart == topEnd)
				break;
		}
		for (int left = sideEnd; left > sideStart; --left)
		{
			nublist[indexx] = array[left][topStart];
			++indexx;
			if (sideStart == sideEnd)
				break;
		}
		if (topStart == topEnd && sideStart == sideEnd && topStart==sideStart)
		{
			nublist[indexx] = array[topStart][sideStart];
			++indexx;
		}

		return nublist;
	}
	
	public static int GetouterRingIndex(int topStart, int topEnd, int sideStart, int sideEnd, int[][] array, int[] nublist, int indexx)
	{	
		for (int top = topStart; top < topEnd; ++top)
		{
			nublist[indexx] = array[sideStart][top];
			++indexx;
		}
		for (int right = sideStart; right < sideEnd; ++right)
		{
			nublist[indexx] = array[right][topEnd];
			++indexx;
		}
		for (int bottom = topEnd; bottom > topStart; --bottom)
		{
			nublist[indexx] = array[sideEnd][bottom];
			++indexx;
			if (topStart == topEnd)
				break;
		}
		for (int left = sideEnd; left > sideStart; --left)
		{
			nublist[indexx] = array[left][topStart];
			++indexx;
			if (sideStart == sideEnd)
				break;
		}
		if (topStart == topEnd && sideStart == sideEnd && topStart==sideStart)
		{
			nublist[indexx] = array[topStart][sideStart];
			++indexx;
		}
		return indexx;
	}


	
	public static int[] vortex(int[][] array)
	{
		int ts = 0;
		int te = array[0].length - 1;
		int ss = 0;
		int se = array.length - 1;
		int[] numlist = new int[(array[0].length * array.length)];
		int currentindex = 0;
		
		for(int x = 0;(x < (array[0].length / 2)) && (x < (array.length / 2)); ++x)
		{	
			numlist = GetouterRing(ts,te,ss,se,array,numlist,currentindex);
			
			currentindex = GetouterRingIndex(ts,te,ss,se,array,numlist,currentindex);
			
			++ts;
			--te;
			++ss;
			--se;
			
		}
		
		if (ts == te || ss == se)
		{
			if (ts == te && ss == se)
				numlist = GetouterRing(ts,te,ss,se,array,numlist,currentindex);
			else if (ss == se)
			{
				for (int top = ts; top <= te; ++top)
				{
					numlist[currentindex] = array[ss][top];
					++currentindex;
				}
			}
			else if (ts == te)
			{
				for (int right = ss; right <= se; ++right)
				{
					numlist[currentindex] = array[right][te];
					++currentindex;
				}
			}
		}
		
		
		return numlist;
		
	}
	
	//=======================================================================================================================================================================================
	//=====(Testing Zone)====================================================================================================================================================================
	//=======================================================================================================================================================================================
	
    public static void main (String [] args) 
    {
		Scanner scnr = new Scanner(System.in);
		/*// Method 1: tester
		String stringValueTester = " ";
		while (!(stringValueTester.equals("Stop")))
		{
			System.out.println("Enter Test String for stringValue: ");
			stringValueTester = scnr.nextLine();
			System.out.println(stringValue(stringValueTester));
		}
		*/
		
		/*// Method 2: tester
		System.out.println(expValue(-7, 0.0001));
		*/
		
		/*// Method 3: tester
		int ValueTester = 0;
		while (!(ValueTester == -1))
		{
			System.out.println("Enter Test: ");
			ValueTester = scnr.nextInt();
			System.out.println(mirrorNum(ValueTester));
		}
		*/
		
		/*// Method 4: tester
		int ValueTester = 0;
		while (!(ValueTester == -1))
		{
			System.out.println("Enter Test: ");
			ValueTester = scnr.nextInt();
			System.out.println(raisedNum(ValueTester));
		}
		*/
		
		/*// Method 5: tester
		int[][] testcase1 = {{0,1,2},{-4,5,6},{7,8,3}};
		int[][] testcase2 = {{0,0,0},{1,1,1},{2,2,2}};
		int[][] testcase3 = {{-19,-1,4},{4,5,6},{17,-16,0},{17,8,0},{17,88,0}};
		int[][] testcase4 = {{0,1},{5,6},{8,3}};
		int[][] testcase5 = {{1,2,3,4,5},{1,2,3,4,5},{1,2,3,4,5}};
		int[][] testcase6 = {{0,0},{0,0},{0,0},{0,0}};
		int[][] testcase7 = {{99,-100,200},{1,2,3},{4,9,5}};
		int[][] testcase8 = {{1,2,3,4,5,6,7,8,9,10},{1,2,3,4,5,6,7,8,9,10},{1,2,3,4,5,6,7,8,9,10},{1,2,3,4,5,6,7,8,9,10},{1,2,3,4,5,6,7,8,9,10}};
		
		int[][] array = smallestSubarray(testcase3, 130);
		
		for(int x = 0;x < array.length; ++x)
		{
			for(int y = 0;y < array[x].length; ++y)
			{
				System.out.print(array[x][y] + " ");
			}
			System.out.println(" ");
		}
		*/
		
		
		/*// Method 6: tester
		int[][] array = {{0,1,2,3,4,5},{5,4,3,4}};
		int elem = 4;
		int[] newElem = {1,2,3};
		
		replaceElement(array, elem, newElem);
		
		for(int x = 0;x < array.length; ++x)
		{
			for(int y = 0;y < array[x].length; ++y)
			{
				System.out.print(array[x][y] + " ");
			}
			System.out.println(" ");
		}
		*/
		
		/*// Method 7: tester
		int[][] k = {{5,4,4},{4,4}};
        
        int[][] resultx = removeDuplicates(k);
        
        for(int x = 0;x < resultx.length; ++x)
        {
            for(int y = 0;y < resultx[x].length; ++y)
            {
            System.out.print(resultx[x][y] + " ");
            }
            System.out.println(" ");
        }
		
		System.out.println("the length is " + resultx.length);
		*/
		
		/*// Method 8: tester
		int test2dList[][] = {{1,2,3,4},{5,6,7,8},{9,10,11,12},{13,14,15,16}};
		int test2dList2[][] = {{1,2,3},{4,5,6},{7,8,9}};
		int test2dList3[][] = {{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},{11, 12, 13, 14, 15, 16, 17, 18, 19, 20},{21, 22, 23, 24, 25, 26, 27, 28, 29, 30},{31, 32, 33, 34, 35, 36, 37, 38, 39, 40},{41, 42, 43, 44, 45, 46, 47, 48, 49, 50}};
		int test2dList4[][] = {{1, 2, 3},{4, 5, 6},{7, 8, 9},{10, 11, 12},{13, 14, 15},{16, 17, 18},{19, 20, 21},{22, 23, 24},{25, 26, 27},{28, 29, 30}};
		int test2dList5[][] = {{1, 2, 3, 4, 5},{6, 7, 8, 9, 10},{11, 12, 13, 14, 15},{16, 17, 18, 19, 20},{21, 22, 23, 24, 25},{26, 27, 28, 29, 30}};
		int test2dList6[][] = {{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},{11, 12, 13, 14, 15, 16, 17, 18, 19, 20},{21, 22, 23, 24, 25, 26, 27, 28, 29, 30}};
		int test2dList7[][] = {{1,2},{3,4}};
		int test2dList8[][] = {{1,2,3}};
		int test2dList9[][] = {{1,2},{3,4},{5,6},{7,8},{9,10}};
		int test2dList10[][] = {{1,2,3,4,5},{6,7,8,9,10},{11,12,13,14,15},{16,17,18,19,20}};
		
		int[] finallist = vortex(test2dList10);
		
		for (int item = 0; item < finallist.length; ++item)
			System.out.print(finallist[item] + " ");
		*/
		
    }
}