package com.sjneves.calculator;

import org.springframework.stereotype.Service;

@Service
public class CalculatorService {

    public double calculate(double a, double b, String op) {
        return switch (op) {
            case "+" -> a + b;
            case "-" -> a - b;
            case "*" -> a * b;
            case "/" -> divide(a, b);
            default -> throw new IllegalArgumentException(Messages.operatorNotSupported(op));
        };
    }

    private double divide(double a, double b) {
        if (b == 0) {
            throw new ArithmeticException(Messages.DIVIDE_BY_ZERO);
        }
        return a / b;
    }
}