package com.sjneves.calculator;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CalculatorController.class)
class CalculatorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CalculatorService service;

    @Test
    @DisplayName("[CALC-300] should call service with correct arguments")
    void shouldCallServiceWithCorrectArguments() throws Exception {
        when(service.calculate(7.0, 3.0, "+")).thenReturn(10.0);

        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 7, \"b\": 3, \"op\": \"+\"}"))
                .andExpect(status().isOk());

        verify(service).calculate(7.0, 3.0, "+");
    }

    @Test
    @DisplayName("[CALC-301] should calculate successfully")
    void shouldCalculateSuccessfully() throws Exception {
        when(service.calculate(7.0, 3.0, "+")).thenReturn(10.0);

        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 7, \"b\": 3, \"op\": \"+\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(10.0));
    }

    @Test
    @DisplayName("[CALC-302] should return 422 when dividing by zero")
    void shouldReturn422WhenDividingByZero() throws Exception {
        when(service.calculate(5.0, 0.0, "/"))
                .thenThrow(new ArithmeticException(Messages.DIVIDE_BY_ZERO));

        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"b\": 0, \"op\": \"/\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value(Messages.DIVIDE_BY_ZERO));
    }

    @Test
    @DisplayName("[CALC-303] should return 400 when operator is invalid")
    void shouldReturn400WhenOperatorIsInvalid() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"b\": 3, \"op\": \"%\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(Messages.INVALID_OPERATOR));
    }

    @Test
    @DisplayName("[CALC-304] should return 400 when operator is null")
    void shouldReturn400WhenOperatorIsNull() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"b\": 3, \"op\": null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(Messages.INVALID_OPERATOR));
    }

    @Test
    @DisplayName("[CALC-305] should return 400 when first number is missing")
    void shouldReturn400WhenFirstNumberIsMissing() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"b\": 3, \"op\": \"+\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(Messages.INVALID_NUMBERS));
    }

    @Test
    @DisplayName("[CALC-306] should return 400 when second number is missing")
    void shouldReturn400WhenSecondNumberIsMissing() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"op\": \"+\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(Messages.INVALID_NUMBERS));
    }

    @Test
    @DisplayName("[CALC-307] should return 400 when first number is null")
    void shouldReturn400WhenFirstNumberIsNull() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": null, \"b\": 3, \"op\": \"+\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(Messages.INVALID_NUMBERS));
    }

    @Test
    @DisplayName("[CALC-308] should return 400 when second number is null")
    void shouldReturn400WhenSecondNumberIsNull() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"b\": null, \"op\": \"+\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(Messages.INVALID_NUMBERS));
    }

    @Test
    @DisplayName("[CALC-309] should return 400 when first number is string")
    void shouldReturn400WhenFirstNumberIsString() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": \"abc\", \"b\": 3, \"op\": \"+\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(Messages.INVALID_FORMAT));
    }

    @Test
    @DisplayName("[CALC-310] should return 400 when second number is string")
    void shouldReturn400WhenSecondNumberIsString() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"b\": \"abc\", \"op\": \"+\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(Messages.INVALID_FORMAT));
    }
}