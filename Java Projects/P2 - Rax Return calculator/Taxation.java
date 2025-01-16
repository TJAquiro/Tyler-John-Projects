import java.io.File;
import java.util.Scanner;

public class Taxation
{
	/**
	* @param socialSecurityRate - taxation rate of Social Security
	* @param socialSecurityIncomeLimit - the most Social Security tax someone can pay
	* @param medicareRate - taxation rate of medicare
	* @param adultBaseExemption - tax Exemptions for adults
	* @param childBaseExemption - tax Exemptions for children
	* @param medianIncomePerCapita - the median Income Per Capita
	* @param incomeBracket - A 2D array that stores data about income ranges for taxation
	* @param taxRate - A 2D array that stores data about taxation rates in each braket
	*/
	
	private static float socialSecurityRate = (float)12.4;
	private static float socialSecurityIncomeLimit = (float)137700.0;
	private static float medicareRate = (float)2.9;
	private static float adultBaseExemption = (float)3000.0;
	private static float childBaseExemption = (float)2000.0;
	private static float medianIncomePerCapita = (float)31099.0;
	private static float[][] incomeBracket = {{10000f,40000f,80000f,160000f},{20000f,70000f,160000f,310000f},{12000f,44000f,88000f,170000f}};
	private static float[][] taxRate = {{0.1f,0.12f,0.22f,0.24f,0.32f},{0.1f,0.12f,0.23f,0.25f,0.33f},{0.1f,0.12f,0.24f,0.26f,0.35f}};
	
	//@getSocialSecurityRate getter for socialSecurityRate
	
	public float getSocialSecurityRate()
	{
		return socialSecurityRate;
	}
	
	//@getSocialSecurityRate getter for socialSecurityRate
	
	public float getSocialSecurityIncomeLimit()
	{
		return socialSecurityIncomeLimit;
	}
	
	//@getMedicareRate getter for medicareRate
	
	public float getMedicareRate()
	{
		return medicareRate;
	}
	
	//@getAdultBaseExemption getter for adultBaseExemption
	
	public float getAdultBaseExemption()
	{
		return adultBaseExemption;
	}
	
	//@getChildBaseExemption getter for childBaseExemption
	
	public float getChildBaseExemption()
	{
		return childBaseExemption;
	}
	
	//@getMedianIncomePerCapita getter for medianIncomePerCapita
	
	public float getMedianIncomePerCapita()
	{
		return medianIncomePerCapita;
	}
	
	//@loadParameters takes in a text file and uses that data to set fields
	
	public static void loadParameters(String filename)
	{
		try
		{
			String words;
			String[] lineparts;
		
			File myFile = new File("TaxationTesting.txt");
			Scanner line = new Scanner(myFile);
			
			while(line.hasNextLine())
			{
				words = line.nextLine();
				
				lineparts = words.split(" ");
				
				if (lineparts[0].equals("socialSecurityRate"))
				{
					socialSecurityRate = (float)(Float.parseFloat(lineparts[1]));
				}
				else if (lineparts[0].equals("socialSecurityIncomeLimit"))
				{
					socialSecurityIncomeLimit = (float)(Float.parseFloat(lineparts[1]));
				}
				else if (lineparts[0].equals("medicareRate"))
				{
					medicareRate = (float)(Float.parseFloat(lineparts[1]));
				}
				else if (lineparts[0].equals("adultBaseExemption"))
				{
					adultBaseExemption = (float)(Float.parseFloat(lineparts[1]));
				}
				else if (lineparts[0].equals("childBaseExemption"))
				{
					childBaseExemption = (float)(Float.parseFloat(lineparts[1]));
				}
				else if (lineparts[0].equals("medianIncomePerCapita"))
				{
					medianIncomePerCapita = (float)(Float.parseFloat(lineparts[1]));
				}
				
			}
		}
		catch (Exception e)
		{
			System.out.println("File not found");
		}
	}
	
	//@bracketIncome for getting incomeBracket
	
	private float[][] bracketIncome()
	{
		float[][] bracket = incomeBracket;
		
		return bracket;
	}
	
	//@bracketIncome for getting taxRate
	
	private float[][] taxRates()
	{
		float[][] bracket = taxRate;
		
		return bracket;
	}
	
	//@getNumTaxBrackets counts number of tax brakets
	
	public static byte getNumTaxBrackets()
	{
		return (byte)(taxRate.length);
	}
	
	public static byte maxIncomeTaxBracket(Family family)
	{
		float[][] bracket = incomeBracket;
		byte bracketnum = 1;
		
		for(int x = 0; x < bracket[family.getFilingStatus()-1].length; ++x)
		{
			if(family.getTaxableIncome() > bracket[family.getFilingStatus()-1][x])
			{
				++bracketnum;
			}
		}
		return bracketnum;
	}
	
	//@bracketIncome calculates how much of a family's income falls with a certain bracket
	
	public static float bracketIncome(Family family, byte b)
	{
		float[][] bracket = incomeBracket;
		
		if (b == 1)
		{
			return family.getTaxableIncome();
		}
		
		return family.getTaxableIncome() - (bracket[family.getFilingStatus()][b-2]);
	}
	
	//@bracketTaxRate Returns the tax rate that corresponds to bracket b and filing status f
	
	public static float bracketTaxRate(byte b, byte f)
	{
		float[][] bracket = taxRate;
		
		return bracket[f][b];
	}
	
	//@amountTakenFromBrakets calculates how much a bracket takes in tax for a family
	
	public static float amountTakenFromBrakets(Family family)
	{
		float[][] bracket = incomeBracket;
		float[][] bracketRates = taxRate;
		
		float subtractor = 0;
		float returnNum = 0;
		float moneyAvalible = family.getTaxableIncome();
		
		for(int x = 0;x < maxIncomeTaxBracket(family) - 1; ++x)
		{
			
			
			returnNum = returnNum + ((bracket[family.getFilingStatus()-1][x] - subtractor) * bracketRates[family.getFilingStatus()-1][x]);

			
			subtractor = bracket[family.getFilingStatus()-1][x];
			
		}
		
		returnNum = returnNum + ((moneyAvalible - subtractor) * bracketRates[family.getFilingStatus()-1][maxIncomeTaxBracket(family)-1]);
		
		return returnNum;
		
	}
	
}