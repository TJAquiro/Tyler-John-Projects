package Practice8;

import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class YouthIntakeApp {

    static Map<String, Integer> priorityThresholds = new HashMap<>();

    public static void main(String[] args) {

        if (args.length == 0) {
            System.out.println("Please add age and Risk Score");

            System.exit(1);
        }

        priorityThresholds.put("HIGH", 8);
        priorityThresholds.put("MEDIUM", 5);

        try {
            int age = Integer.parseInt(args[0]);
            int riskScore = Integer.parseInt(args[1]);

            if (age < 0) { // TODO: ask what the max age should be
                System.out.println(args[0] + " is not a valid age");
            }
            if (riskScore < 1 || riskScore > 10) {
                System.out.println(args[1] + " is not a Risk Score");
            }

            String priority = calculatePriority(age, riskScore);

            System.out.println("Calculated Priority: " + priority);

            saveResult(priority);

        } catch (IllegalArgumentException e) { // TODO user friendly error messages, Include what the wrong input was,
                                               // and for what varible
            System.out.println("x is a invalide integer for y");
        }
    }

    public static String calculatePriority(int age, int riskScore) {

        if (riskScore >= priorityThresholds.get("HIGH") && age <= 18) {
            return "HIGH";
        }

        if (riskScore >= priorityThresholds.get("MEDIUM")) {
            return "MEDIUM";
        }

        if (riskScore < 0) { // TODO Remove this
            return null;
        }

        return "LOW";
    }

    public static void saveResult(String priority) {

        FileWriter writer;
        try {
            writer = new FileWriter("output.json");

            writer.write("{ \"priority\": \"" + priority + "\" }");

            writer.close();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
}
