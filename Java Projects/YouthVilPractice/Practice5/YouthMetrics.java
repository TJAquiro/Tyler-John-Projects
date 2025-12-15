import java.util.ArrayList;
import java.util.List;

public class YouthMetrics {

    private List<Integer> metrics;

    public YouthMetrics() {
        metrics = new ArrayList<Integer>();
    }

    public void addMetric(String metric) throws NegativeNumberException {
        try {
            int value = Integer.parseInt(metric);

            if (value < 0) {
                throw new NegativeNumberException();
            }
            metrics.add(value);
        } catch (NumberFormatException e) {
            System.out.println("Invalid input: " + metric);
        } catch (NegativeNumberException e) {
            System.out.println("Negative number not allowed: " + metric);
        }
    }

    public double calculateAverage() {
        double sum = 0;

        for (int i = 0; i < metrics.size(); i++) {
            sum += metrics.get(i);
        }

        return (Math.round((sum / (double) metrics.size()) * 100.00)) / 100.00;
    }

    public int highestMetric() {
        int max = metrics.get(0);

        for (Integer m : metrics) {
            if (m > max)
                max = m;
        }

        return max;
    }

    public int lowestMetric() {
        int min = metrics.get(0);

        for (Integer m : metrics) {
            if (m < min)
                min = m;
        }

        return min;
    }

    public static void main(String[] args) throws NegativeNumberException {
        YouthMetrics ym = new YouthMetrics();

        ym.addMetric("90");
        ym.addMetric("80");
        ym.addMetric("85");
        ym.addMetric("90");
        ym.addMetric("95");
        ym.addMetric("100");
        ym.addMetric("90");
        ym.addMetric("potato");
        ym.addMetric("-1000");
        ym.addMetric("1");

        System.out.println("Average: " + ym.calculateAverage());
        System.out.println("Highest: " + ym.highestMetric());
        System.out.println("Lowest: " + ym.lowestMetric());
    }
}