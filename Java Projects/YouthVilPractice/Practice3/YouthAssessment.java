package Practice3;

import java.util.ArrayList;
import java.util.List;

public class YouthAssessment {

    private List<Integer> assessments;

    public YouthAssessment() {
        assessments = new ArrayList<>();
    }

    public void addScore(String score) {
        int value = Integer.parseInt(score);

        try {
            if (value < 0 || value > 100) {
                throw new IllegalArgumentException(value + " is not between 0-100");
            }

            assessments.add(value);
        } catch (IllegalArgumentException e) {
            System.out.println("Caught exception: " + e.getMessage());
        }
    }

    public double calculateAverage() {
        int sum = 0;

        for (int i = 0; i < assessments.size(); i++) {
            sum += assessments.get(i);
        }

        double value = sum / (double) assessments.size();

        return Math.round(value * 100) / 100.00;
    }

    public int highestScore() {

        if (assessments.isEmpty()) {
            System.out.println("No Assessments Added");
            return -1;
        }

        int max = assessments.get(0);

        for (int num : assessments) {
            max = Math.max(num, max);
        }

        return max;

    }

    public int lowestScore() {

        if (assessments.isEmpty()) {
            System.out.println("No Assessments Added");
            return -1;
        }

        int min = assessments.get(0);

        for (int num : assessments) {
            min = Math.min(num, min);
        }

        return min;

    }

    public static void main(String[] args) {
        YouthAssessment ya = new YouthAssessment();

        ya.addScore("85");
        ya.addScore("2");
        ya.addScore("85");
        ya.addScore("87");

        System.out.println("Average assessment score: " + ya.calculateAverage());
        System.out.println("Average assessment score: " + ya.highestScore());
        System.out.println("Average assessment score: " + ya.lowestScore());
    }
}
