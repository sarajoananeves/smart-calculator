package com.sjneves.calculator;

public record ErrorResponse(String error) implements CalculatorResponse, ParserResponse {}