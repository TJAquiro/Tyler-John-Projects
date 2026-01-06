package Practice6;

import java.io.FileWriter;
import java.io.IOException;

public class IntakeCalculator {
    public static void main(String[] args) {

        try {
            int age = Integer.parseInt(args[0]);
            int riskScore = Integer.parseInt(args[1]);

            String priority = calculatePriority(age, riskScore);

            System.out.println("Priority Level: " + priority);

            writeResultToFile(priority);
        } catch (IllegalArgumentException e) {
            System.out.println("Invalid inputs");
        }
    }

    public static String calculatePriority(int age, int riskScore) {

        //Risk Scores must be between these values
        final int maxRiskScore = 10;
        final int minRiskScore = 0;

        //High Risk, If someone has both of these they are considered high risk
        final int highRiskScore = 8; //this score or above may be considered high risk
        final int highRiskAge = 18; //anyone below this age may be considered high risk

        //Medium Risk
        final int mediumRiskScore = 5; // anyone with a score higher than this is at least Medium Risk


        if(riskScore < minRiskScore || riskScore > maxRiskScore)
            return "Invalid Risk Score";

        if (riskScore >= highRiskScore && age < highRiskAge) {
            return "HIGH";
        } else if (riskScore >= mediumRiskScore) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }

    public static void writeResultToFile(String priority) {
        try {
            FileWriter writer = new FileWriter("result.json");
            writer.write("{ \"priority\": \"" + priority + "\" }");
            writer.close();
        } catch (IOException e) {
            System.out.println("Error writing file");
        }
    }
}
