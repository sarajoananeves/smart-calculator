package com.sjneves.calculator;

public final class Messages {

    public static final String INVALID_NUMBERS = "Please enter valid numbers";
    public static final String INVALID_OPERATOR = "Operator must be one of: +, -, *, /";
    public static final String DIVIDE_BY_ZERO = "Cannot divide by zero";

    public static String operatorNotSupported(String op) {
        return "Operator not supported: " + op;
    }

    private Messages() {
        // utility class — prevent instantiation
    }
}