*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}    http://localhost:5173/
${EMAIL}    Kunita.n@kkumail.ac.th
${PASS}    admin2

*** Keywords ***
Login With officer
    Open Browser    ${URL}    edge
    Input Text    id=email    ${EMAIL}
    Input Password    id=password    ${PASS}
    Click Element    //*[@id="root"]/div/div/form/button



*** Test Cases ***
Login
    Login With officer
    
    Close Browser