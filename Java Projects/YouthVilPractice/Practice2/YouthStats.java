// YouthStats.java

import java.util.ArrayList;
import java.util.List;

public class YouthStats {

    private List<Integer> numbers;
    private List<Integer> sortedNumbers;

    public YouthStats() {
        numbers = new ArrayList<>();
        sortedNumbers = new ArrayList<>();
    }

    public void addNumber(String n) {
        int value = Integer.parseInt(n);

        if (value < 0) {
            System.out.println("Number Can't be negative");
        } else {
            numbers.add(value);
            sortedNumbers.add(value);
            sortedNumbers.sort(null);
        }
    }

    public double median() {
        if (numbers.size() == 0)
            return 0;

        int middle = numbers.size() / 2;

        if (numbers.size() % 2 == 0) {

            return (sortedNumbers.get(middle) + sortedNumbers.get(middle - 1)) / 2;
        } else {
            return sortedNumbers.get(middle);
        }
    }

    public int getMinimum() {

        return sortedNumbers.get(0);
    }

    public int getMaximum() {

        return sortedNumbers.get(sortedNumbers.size() - 1);

    }

    public int printElement(int n) {

        return numbers.get(n);
    }

    public static void main(String[] args) {
        YouthStats ys = new YouthStats();

        ys.addNumber("30");
        ys.addNumber("20");
        ys.addNumber("10");
        ys.addNumber("40");
        ys.addNumber("50");
        ys.addNumber("60");

        System.out.println("Median: " + ys.median());
        System.out.println("Max: " + ys.getMaximum());
        System.out.println("Min: " + ys.getMinimum());
        System.out.println("Printed Element: " + ys.printElement(1));
    }
}
