import java.io.File;
import java.util.Scanner;

public class P2tester
{
	
	public static void main (String [] args)
	{
		
		Taxation taxation = new Taxation();
		/*
		//creates person A obj
		Person a = new Person();
		
		a.Person();
		
		System.out.println("---" + a.getId());
		
		System.out.println(a.setName("George Mason"));
		
		System.out.println(a.setBirthday("2003/07/14"));
		
		System.out.println(a.setSSN("123-45-6789"));
		
		System.out.println(a.setGrossIncome((float)21000.0159999999));
		System.out.println(a.getGrossIncome());
		
		System.out.println(a.toString());
		
		//creates person B obj
		Person b = new Person();
		
		b.Person();
		
		System.out.println("---" + b.getId());
		
		//creates Adult A1 obj
		Adult a1 = new Adult("Sam", "2003/07/14", "123-45-6789", (float)1000.111, "George Mason");
		
		System.out.println("---" + a1.getId());
		
		System.out.println(a1.setName("George Mason"));
		
		System.out.println(a1.setBirthday("2003/07/14"));
		
		System.out.println(a1.setSSN("123-45-6789"));
		
		System.out.println(a1.setGrossIncome((float)50000.00));
		System.out.println(a1.getGrossIncome());
		
		System.out.println(a1);
		
		System.out.println(a1.adjustedIncome());
		
		System.out.println(a1.taxWithheld());
		
		//creates Child B1 obj
		
		Child b1 = new Child("Sam", "2003/07/14", "123-45-6789", (float)1000.00, "George Mason College", (float)40000.00);
		
		System.out.println(b1);
		
		System.out.println("---" + b1.getId());
		
		//family
		
		System.out.println();
		
		Person[] membersArray = {a1,b1};
		
		Family c = new Family(membersArray, (byte)2);
		
		System.out.println(a1 instanceof Adult);
		
		
		for(int x = 0;x < c.getMembers().length; ++x)
		{
			System.out.println(c.getMembers()[x]);
		}
		
		System.out.println(b1.getId());
		
		System.out.println(c.getNumAdults());
		System.out.println(c.getNumChildren());
		
		System.out.println(a1.adjustedIncome());
		System.out.println(a1.deduction(c));
		
		System.out.println(b1.getGrossIncome());
		System.out.println(b1.deduction(c));
		
		System.out.println(c.getTaxableIncome());
		System.out.println(c.taxCredit());
		
		Taxation d = new Taxation();
		
		System.out.println(d.getMedicareRate());
		
		d.loadParameters("TaxationTesting.txt");
		
		System.out.println(d.getMedicareRate());
		
		System.out.println(d.maxIncomeTaxBracket(c));
		*/
		
		/*
		Adult a1 = new Adult("name1", "1232/02/22", "987-65-4320", 0.00f, "GMU");
		Adult a2 = new Adult("name2", "1332/02/22", "987-65-4321", 1234.56f, "GMU");
		Adult a3 = new Adult("name3", "1432/02/22", "987-65-4322", 13456.78f, "GMU");
		Adult a4 = new Adult("name4", "1572/02/22", "987-65-4323", 23979.54f, "GMU");
		Adult a5 = new Adult("name5", "1632/02/22", "987-65-4324", 67890.12f, "GMU");
		Adult a6 = new Adult("name6", "1732/02/22", "987-65-4325", 123456.78f, "GMU");
		Adult a7 = new Adult("name7", "1876/05/01", "789-56-1236", 145000.98f, "Mason");
		Adult a8 = new Adult("name8", "1932/02/22", "987-65-4327", 267890.12f, "GMU");
		Adult a9 = new Adult("name9", "2032/02/22", "987-65-4328", 312346.78f, "GMU");
		Child c1 = new Child("kid1", "1200/01/01", "999-65-1110", 0.0f, "FHS", 3300.0f);
		Child c2 = new Child("kid2", "1300/01/01", "999-65-1111", 100.0f, "FHS", 0.0f);
		Child c3 = new Child("kid3", "1400/01/01", "999-65-1112", 300.0f, "FHS", 0.0f);
		Child c4 = new Child("kid4", "1500/01/01", "999-65-1113", 900.0f, "FHS", 900.0f);
		Child c5 = new Child("kid5", "1600/01/01", "999-65-1114", 1600.0f, "FHS", 1234.0f);
		Child c6 = new Child("kid6", "1700/01/01", "999-65-1115", 7300.0f, "FHS", 6650.0f);
		Child c7 = new Child("kid7", "1800/01/01", "999-65-1116", 12000.0f, "FHS", 11999.0f);
		Child c8 = new Child("kid8", "1900/01/01", "999-65-1117", 27000.0f, "FHS", 100.0f);
		Child c9 = new Child("kid9", "2000/01/01", "999-65-1118", 41560.0f, "FHS", 8765.0f);
		
		Adult at1 = new Adult("name1", "1232/02/22", "987-65-4320", 15000.0f, "GMU");
		
		Child ct1 = new Child("kid1", "1200/01/01", "999-65-1110", 10000.0f, "FHS", 3300.0f);
		
		Family f1 = new Family((byte)1, (byte)1);
		f1.addMember(at1);
		
		System.out.println("Filing Status == " + f1.getFilingStatus());
		
		System.out.println("ID == " + a6.getId());
		
		System.out.println("Adjusted Income == " + at1.adjustedIncome());
		
		System.out.println("TaxWithheld Income == " + at1.taxWithheld());
		
		System.out.println("Taxable Income == " + f1.getTaxableIncome());
		
		System.out.println("Adjusted Income == " + at1.adjustedIncome());

		System.out.println("Adult deduction amount == " + at1.deduction(f1));
		
		System.out.println("Child deduction amount == " + ((Child)c7).deduction(f1));
		
		System.out.println("getNumAdults amount == " + (f1.getNumAdults()));
		
		System.out.println("getNumChildren amount == " + (f1.getNumChildren()));
		
		System.out.println("taxCredit amount == " + (f1.taxCredit()));
		
		System.out.println("Taxable Income == " + f1.getTaxableIncome());
		
		System.out.println("maxIncomeTaxBracket Income == " + taxation.maxIncomeTaxBracket(f1));
		
		System.out.println("amountTakenFromBrakets amount == " + (taxation.amountTakenFromBrakets(f1)));
		*/
		
		
		
		
		Adult a1 = new Adult("name1", "1232/02/22", "987-65-4320", 0.00f, "GMU");
		Adult a2 = new Adult("name2", "1332/02/22", "987-65-4321", 1234.56f, "GMU");
		Adult a3 = new Adult("name3", "1432/02/22", "987-65-4322", 13456.78f, "GMU");
		Adult a4 = new Adult("name4", "1572/02/22", "987-65-4323", 23979.54f, "GMU");
		Adult a5 = new Adult("name5", "1632/02/22", "987-65-4324", 67890.12f, "GMU");
		Adult a6 = new Adult("name6", "1732/02/22", "987-65-4325", 123456.78f, "GMU");
		Adult a7 = new Adult("name7", "1876/05/01", "789-56-1236", 145000.98f, "Mason");
		Adult a8 = new Adult("name8", "1932/02/22", "987-65-4327", 267890.12f, "GMU");
		Adult a9 = new Adult("name9", "2032/02/22", "987-65-4328", 312346.78f, "GMU");
		Child c1 = new Child("kid1", "1200/01/01", "999-65-1110", 0.0f, "FHS", 3300.0f);
		Child c2 = new Child("kid2", "1300/01/01", "999-65-1111", 100.0f, "FHS", 0.0f);
		Child c3 = new Child("kid3", "1400/01/01", "999-65-1112", 300.0f, "FHS", 0.0f);
		Child c4 = new Child("kid4", "1500/01/01", "999-65-1113", 900.0f, "FHS", 900.0f);
		Child c5 = new Child("kid5", "1600/01/01", "999-65-1114", 1600.0f, "FHS", 1234.0f);
		Child c6 = new Child("kid6", "1700/01/01", "999-65-1115", 7300.0f, "FHS", 6650.0f);
		Child c7 = new Child("kid7", "1800/01/01", "999-65-1116", 12000.0f, "FHS", 11999.0f);
		Child c8 = new Child("kid8", "1900/01/01", "999-65-1117", 27000.0f, "FHS", 100.0f);
		Child c9 = new Child("kid9", "2000/01/01", "999-65-1118", 41560.0f, "FHS", 8765.0f);
		
		Family f1 = new Family((byte)2, (byte)3);
		f1.addMember(a1);
		f1.addMember(c1);
		f1.calculateTax();
		Family f2 = new Family((byte)4, (byte)2);
		f2.addMember(a2);
		f2.addMember(a3);
		f2.addMember(c2);
		f2.addMember(c3);
		f2.calculateTax();
		Family f3 = new Family((byte)3, (byte)2);
		f3.addMember(a4);
		f3.addMember(a5);
		f3.addMember(c4);
		f3.calculateTax();
		Family f4 = new Family((byte)6, (byte)2);
		f4.addMember(a6);
		f4.addMember(a7);
		f4.addMember(c5);
		f4.addMember(c6);
		f4.addMember(c7);
		f4.addMember(c8);
		f4.calculateTax();
		Family f5 = new Family((byte)2, (byte)2);
		f5.addMember(a8);
		f5.addMember(a9);
		f5.calculateTax();
		Family f6 = new Family((byte)1, (byte)1);
		f6.addMember(c9);
		TaxYear y = new TaxYear(100);
		System.out.println(y.taxFiling(f1)); // returns true
		System.out.println(y.taxFiling(f2)); // returns true
		System.out.println(y.taxFiling(f3)); // returns true
		System.out.println(y.taxFiling(f4)); // returns true
		System.out.println(y.taxFiling(f5)); // returns true
		System.out.println(y.taxFiling(f6)); // returns false
		System.out.println(y.numberOfReturnsFiled()); // returns 5
		System.out.println(y.numberOfPersonsFiled()); // returns 17
		System.out.println(y.taxWithheld()); // returns 142866.65
		System.out.println(y.taxOwed()); // returns 216255.72
		System.out.println(y.taxDue()); // returns 73119.06
		System.out.println(y.taxCredits()); // returns 270.0
		
		System.out.println("-----------------------------");
		Analytics analytics = new Analytics(y);
		
		System.out.println(analytics.averageFamilyIncome());
		System.out.println(analytics.averagePersonIncome());
		System.out.println(analytics.maxFamilyIncome());
		System.out.println(analytics.maxPersonIncome());
		System.out.println(analytics.familiesBelowPovertyLimit());
		System.out.println(analytics.familyRank(f5));
		
		
	}
}