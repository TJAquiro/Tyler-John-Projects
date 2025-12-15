package Practice1;
// YouthCalculator.java
// INTENTIONALLY CONTAINS COMPILER ERRORS & A LOGIC BUG

import java.util.ArrayList;
import java.util.List;

public class YouthCalculator {

    private List<Integer> ages;

    public YouthCalculator() {
        ages = new ArrayList<>();
    }

    public void addAge(String age) {

        int ageInt = Integer.parseInt(age);

        if (ageInt > 0 && ageInt < 25) {
            ages.add(ageInt);
        } else {
            System.out.println("invalid age");
        }
    }

    public double calculateAverage() {
        double sum = 0;

        for (int num : ages) {
            sum += num;
        }

        if (ages.size() == 0) {
            return 0;
        } else {
            return Math.round((sum / ages.size()) * 100) / 100;
        }
    }

    public int getOldestAge() {

        int maxAge = 0;

        if (ages.size() == 0) {
            System.out.println("No ages added");
            return -1;
        } else {
            for (int num : ages) {
                maxAge = Math.max(maxAge, num);
            }

            return maxAge;
        }

    }

    public static void main(String[] args) {
        YouthCalculator yc = new YouthCalculator();

        yc.addAge("15");
        yc.addAge("17");
        yc.addAge("16");
        yc.addAge("18");
        yc.addAge("27");

        System.out.println("Average age: " + yc.calculateAverage());
        System.out.println("Average age: " + yc.getOldestAge());
    }
}
