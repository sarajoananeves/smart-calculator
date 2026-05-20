package com.sjneves.calculator;

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
    void shouldCallServiceWithCorrectArguments() throws Exception {
        when(service.calculate(7.0, 3.0, "+")).thenReturn(10.0);

        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 7, \"b\": 3, \"op\": \"+\"}"))
                .andExpect(status().isOk());

        verify(service).calculate(7.0, 3.0, "+");
    }

    @Test
    void shouldCalculateSuccessfully() throws Exception {
        when(service.calculate(7.0, 3.0, "+")).thenReturn(10.0);

        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 7, \"b\": 3, \"op\": \"+\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(10.0));
    }

    @Test
    void shouldReturn422WhenDividingByZero() throws Exception {
        when(service.calculate(5.0, 0.0, "/"))
                .thenThrow(new ArithmeticException("Cannot divide by zero"));

        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"b\": 0, \"op\": \"/\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("Cannot divide by zero"));
    }

    @Test
    void shouldReturn400WhenOperatorIsInvalid() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"b\": 3, \"op\": \"%\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Operator must be one of: +, -, *, /"));
    }

    @Test
    void shouldReturn400WhenOperatorIsNull() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"b\": 3, \"op\": null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Operator must be one of: +, -, *, /"));
    }

    @Test
    void shouldReturn400WhenFirstNumberIsMissing() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"b\": 3, \"op\": \"+\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Please enter valid numbers"));
    }

    @Test
    void shouldReturn400WhenSecondNumberIsMissing() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"op\": \"+\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Please enter valid numbers"));
    }

    @Test
    void shouldReturn400WhenFirstNumberIsNull() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": null, \"b\": 3, \"op\": \"+\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Please enter valid numbers"));
    }

    @Test
    void shouldReturn400WhenSecondNumberIsNull() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"b\": null, \"op\": \"+\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Please enter valid numbers"));
    }

    @Test
    void shouldReturn400WhenFirstNumberIsString() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": \"abc\", \"b\": 3, \"op\": \"+\"}"))
                .andExpect(status().isBadRequest());
        // Note: rejected by Jackson before reaching the controller.
        // Response uses Spring's default error format, not our ErrorResponse.
    }

    @Test
    void shouldReturn400WhenSecondNumberIsString() throws Exception {
        mockMvc.perform(post("/api/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"a\": 5, \"b\": \"abc\", \"op\": \"+\"}"))
                .andExpect(status().isBadRequest());
        // Same Jackson-rejection caveat.
    }
}