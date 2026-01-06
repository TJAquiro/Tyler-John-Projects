package Practice7;

import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;

public class IntakeAssessmentPractice {

    static String organizationName = "Youth Villages";

    public static void main(String[] args) {

        int age = 0;
        int riskScore = 0;

        try {

            age = Integer.parseInt(args[0]);
            riskScore = Integer.parseInt(args[1]);

            if (riskScore < 1 || riskScore > 10) {
                throw new IllegalArgumentException("Risk Score must be between 1 and 10.");
            }
            if (age < 0) { // ask what the max age should be
                throw new IllegalArgumentException("Age can not be negative.");
            }

            List<String> notes = new ArrayList<>();

            notes.add("Initial intake complete");
            notes.add("5"); // what is notes, why is 5 being added to it

            String priority = calculatePriority(age, riskScore);

            System.out.println("Organization: " + organizationName);
            System.out.println("Priority Level: " + priority);

            writeToFile(priority);

        } catch (IllegalArgumentException e) {

            System.out.println(e.getMessage());
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Please add arguments [age] [riskScore]");
        }
    }

    public static String calculatePriority(int age, int riskScore) {

        if (riskScore > 8 && age <= 18) { // Check to be sure if this should say <= 18 or ==18
            return "HIGH";
        } else if (riskScore > 5) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }

    public static void writeToFile(String priority) {

        FileWriter writer;
        try {

            writer = new FileWriter("result.json");

            writer.write("{ \"priority\": \"LOW\" }");

            if (priority.equals("HIGH")) {
                System.out.println("High priority case logged");
            }

            writer.close();

        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
}
