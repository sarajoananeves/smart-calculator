package com.sjneves.calculator;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class ExpressionParser {

    private static final Pattern PERCENTAGE = Pattern.compile(
            "^.*?(\\d+(?:\\.\\d+)?)\\s*%\\s*(?:of|on)\\s+(\\d+(?:\\.\\d+)?)\\s*$"
    );

    private static final Pattern OPERATOR = Pattern.compile(
            "^\\s*(-?\\d+(?:\\.\\d+)?)\\s+(\\S+(?:\\s+\\S+)?)\\s+(-?\\d+(?:\\.\\d+)?)\\s*$"
    );

    private static final Map<String, String> OPERATOR_MAP = Map.ofEntries(
            Map.entry("plus", "+"),
            Map.entry("+", "+"),
            Map.entry("minus", "-"),
            Map.entry("-", "-"),
            Map.entry("times", "*"),
            Map.entry("*", "*"),
            Map.entry("x", "*"),
            Map.entry("divided by", "/"),
            Map.entry("/", "/")
    );

    public ParseResponse parse(String expression) {
        String normalized = expression.trim().toLowerCase();

        Matcher percentMatch = PERCENTAGE.matcher(normalized);
        if (percentMatch.matches()) {
            double x = Double.parseDouble(percentMatch.group(1));
            double y = Double.parseDouble(percentMatch.group(2));
            return new ParseResponse(x / 100.0, y, "*");
        }

        Matcher opMatch = OPERATOR.matcher(normalized);
        if (opMatch.matches()) {
            double x = Double.parseDouble(opMatch.group(1));
            String opText = opMatch.group(2).replaceAll("\\s+", " ");
            double y = Double.parseDouble(opMatch.group(3));
            String op = OPERATOR_MAP.get(opText);
            if (op != null) {
                return new ParseResponse(x, y, op);
            }
            // operator word/symbol unknown — fall through to error
        }

        throw new IllegalArgumentException(Messages.COULD_NOT_PARSE);
    }
}