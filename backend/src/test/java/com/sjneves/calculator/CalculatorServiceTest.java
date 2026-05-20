package com.sjneves.calculator;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

class CalculatorServiceTest {

    private final CalculatorService service = new CalculatorService();

    @ParameterizedTest(name = "calculates {0} {2} {1} = {3}")
    @CsvSource({
            // Positive integers — one per operator
            "2, 3, +, 5",
            "10, 4, -, 6",
            "6, 5, *, 30",
            "20, 4, /, 5",

            // Decimals — one per operator (clean float-safe values)
            "5.5, 2.5, +, 8",
            "5.5, 2.5, -, 3",
            "2.5, 4, *, 10",
            "7.5, 2.5, /, 3",

            // Negatives — one per operator
            "-5, 3, +, -2",
            "-5, -3, -, -2",
            "-4, 3, *, -12",
            "-10, 2, /, -5",

            // Zero scenarios
            "0, 5, +, 5",       // zero + something
            "5, 0, *, 0",       // multiply by zero
            "0, 5, /, 0",       // zero divided by something
            "5, 5, -, 0"        // result is zero
    })
    void shouldCalculateCorrectly(double a, double b, String op, double expected) {
        assertThat(service.calculate(a, b, op)).isEqualTo(expected);
    }

    @Test
    void shouldThrowWhenDividingByZero() {
        assertThatThrownBy(() -> service.calculate(5, 0, "/"))
                .isInstanceOf(ArithmeticException.class)
                .hasMessage("Cannot divide by zero");
    }

    @Test
    void shouldThrowWhenOperatorNotSupported() {
        assertThatThrownBy(() -> service.calculate(5, 3, "%"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Operator not supported: %");
    }

    @Test
    void floatingPointShouldNotBeExact() {
        double result = service.calculate(0.1, 0.2, "+");
        assertThat(result).isNotEqualTo(0.3);
    }

    @Test
    void floatingPointShouldBeApproximatelyEqual() {
        double result = service.calculate(0.1, 0.2, "+");
        assertThat(result).isCloseTo(0.3, within(0.0001));
    }
}
