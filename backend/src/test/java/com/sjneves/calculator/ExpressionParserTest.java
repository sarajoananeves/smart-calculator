package com.sjneves.calculator;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExpressionParserTest {

    private final ExpressionParser parser = new ExpressionParser();

    @ParameterizedTest(name = "parses \"{0}\" as ({1} {3} {2})")
    @CsvSource({
            "7 plus 3,        7,   3,   +",
            "10 minus 4,      10,  4,   -",
            "6 times 5,       6,   5,   *",
            "20 divided by 4, 20,  4,   /",
            "7 + 3,           7,   3,   +",
            "6 * 5,           6,   5,   *",
            "5 x 4,           5,   4,   *",
            "7 PLUS 3,        7,   3,   +",
            "-5 plus 3,       -5,  3,   +",
            "2.5 times 4,     2.5, 4,   *"
    })
    void shouldParseOperatorExpression(String expression, double a, double b, String op) {
        ParseResponse result = parser.parse(expression);
        assertThat(result).isEqualTo(new ParseResponse(a, b, op));
    }

    @ParameterizedTest(name = "parses \"{0}\" as percentage (a={1}, b={2}, op=*)")
    @CsvSource({
            "15% of 80,       0.15,  80",
            "15% on 80,       0.15,  80",
            "tip 15% on 80,   0.15,  80",
            "12.5% of 200,    0.125, 200"
    })
    void shouldParsePercentageExpression(String expression, double a, double b) {
        ParseResponse result = parser.parse(expression);
        assertThat(result).isEqualTo(new ParseResponse(a, b, "*"));
    }

    @Test
    void shouldHandleLeadingAndTrailingWhitespace() {
        ParseResponse result = parser.parse("   7 plus 3   ");
        assertThat(result).isEqualTo(new ParseResponse(7.0, 3.0, "+"));
    }

    @Test
    void shouldThrowOnGibberishInput() {
        assertThatThrownBy(() -> parser.parse("hello world"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void shouldThrowOnHalfExpression() {
        assertThatThrownBy(() -> parser.parse("7 plus"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void shouldThrowWhenOperatorHasNoSurroundingSpaces() {
        assertThatThrownBy(() -> parser.parse("5plus3"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void shouldThrowOnUnknownOperatorWord() {
        assertThatThrownBy(() -> parser.parse("5 foo 3"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}