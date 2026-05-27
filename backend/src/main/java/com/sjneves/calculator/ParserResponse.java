package com.sjneves.calculator;

public sealed interface ParserResponse permits ParseResponse, ErrorResponse {}