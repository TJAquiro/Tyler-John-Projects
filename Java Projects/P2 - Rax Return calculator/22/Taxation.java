import java.io.File;
import java.util.Scanner;

public class Taxation
{
	protected float socialSecurityRate = (float)12.4;
	protected float socialSecurityIncomeLimit = (float)137700.0;
	protected float medicareRate = (float)2.9;
	protected float adultBaseExemption = (float)3000.0;
	protected float childBaseExemption = (float)2000.0;
	protected float medianIncomePerCapita = (float)31099.0;
	
	public float getSocialSecurityRate()
	{
		return socialSecurityRate;
	}
	
	public float getSocialSecurityIncomeLimit()
	{
		return socialSecurityIncomeLimit;
	}
	
	public float getMedicareRate()
	{
		return medicareRate;
	}
	
	public float getAdultBaseExemption()
	{
		return adultBaseExemption;
	}
	
	public float getChildBaseExemption()
	{
		return childBaseExemption;
	}
	
	public float getMedianIncomePerCapita()
	{
		return medianIncomePerCapita;
	}
	
	public void loadParameters(String filename)
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
			System.out.println("File not Found");
		}
	}
	
	private float[][] bracketIncome()
	{
		float[][] bracket = {{10000f,40000f,80000f,160000f},{20000f,70000f,160000f,310000f},{12000f,44000f,88000f,170000f}};
		
		return bracket;
	}
	
	private float[][] taxRates()
	{
		float[][] bracket = {{0.1f,0.12f,0.22f,0.24f,0.32f},{0.1f,0.12f,0.23f,0.25f,0.33f},{0.1f,0.12f,0.24f,0.26f,0.35f}};
		
		return bracket;
	}
	
	public int getNumTaxBrackets()
	{
		return ((this.bracketIncome())[0]).length;
	}
	
	public int maxIncomeTaxBracket(Family family)
	{
		float[][] bracket = bracketIncome();
		int bracketnum = 0;
		
		for(int x = 0; x < bracket[family.getFilingStatus()-1].length; ++x)
		{
			if (family.getTaxableIncome() < bracket[family.getFilingStatus()-1][x])
			{
				bracketnum = x;
				break;
			}
		}
		if (family.getTaxableIncome() > bracket[family.getFilingStatus()-1][this.getNumTaxBrackets()-1])
		{			
			bracketnum = this.getNumTaxBrackets();
		}
		return bracketnum + 1;
	}
	
	public float bracketIncome(Family family, int b)
	{
		float[][] bracket = bracketIncome();
		
		return family.getTaxableIncome() - (bracket[family.getFilingStatus()][b-1]);
	}
	
	
	public float bracketTaxRate(int b, int f)
	{
		float[][] bracket = taxRates();
		
		return bracket[f][b];
	}
	
	
	public float amountTakenFromBrakets(Family family)
	{
		float[][] bracket = bracketIncome();
		float[][] bracketRates = taxRates();
		
		float returnNum = 0;
		float moneyAvalible = family.getTaxableIncome();
		
		float subtractor = 0;
		
		for(int x = 1;x < maxIncomeTaxBracket(family); ++x)
		{
			
			returnNum = returnNum + ((bracket[family.getFilingStatus()-1][x-1] - subtractor) * bracketRates[family.getFilingStatus()-1][x-1]);
			
			subtractor = bracket[family.getFilingStatus()-1][x-1];
			
		}
		
		returnNum = returnNum + ((moneyAvalible - subtractor) * bracketRates[family.getFilingStatus()-1][maxIncomeTaxBracket(family)-1]);
		
		return returnNum;
		
	}
	
}