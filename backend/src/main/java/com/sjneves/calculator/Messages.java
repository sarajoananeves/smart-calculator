package com.sjneves.calculator;

public final class Messages {

    public static final String INVALID_NUMBERS = "Please enter valid numbers";
    public static final String INVALID_FORMAT = "Invalid format";
    public static final String INVALID_OPERATOR = "Operator must be one of: +, -, *, /";
    public static final String DIVIDE_BY_ZERO = "Cannot divide by zero";
    public static final String PLEASE_ENTER_EXPRESSION = "Please enter an expression";
    public static final String COULD_NOT_PARSE =
            "Sorry, I couldn't understand that. Try '7 plus 3' or '15% of 80'.";

    public static String operatorNotSupported(String op) {
        return "Operator not supported: " + op;
    }

    private Messages() {
        // utility class — prevent instantiation
    }
}