*** Settings ***
Library    SeleniumLibrary


*** Variables ***
${URL}    http://localhost:5173/
${EMAIL}    neeew.n@kkumail.com
${PASS}    new123


*** Keywords ***
Login To Website by Student
    Open Browser    ${URL}    edge
    Input Text    id=email    neeew.n@kkumail.com
    Input Text    id=password    	new123
    Click Button    //*[@id="root"]/div/div/form/button

    

*** Test Cases ***
NB001
    Login To Website by Student
    Close Browser

NB002
    Login To Website by Student
    Wait Until Element Is Visible    xpath=//li[contains(., 'ส่งคำร้องขอยืม')]
    Click Element                    xpath=//li[contains(., 'ส่งคำร้องขอยืม')]

    Input Text    id=phoneNumber    0987654321
    Input Text    id=WitnessID    643020464-6
    Input Text    id=witnessPhoneNumber    0897654321
    Choose File    //*[@id="root"]/div/div/div[2]/div/div/div/form/div[6]/div/input    D:\\pj2\\Satisfaction.pdf
    Click Button    //*[@id="root"]/div/div/div[2]/div/div/div/form/div[7]/button
    Wait Until Element Is Visible    xpath=//button[contains(@class, 'swal2-confirm')]
    Click Element    xpath=//button[contains(@class, 'swal2-confirm')]
    Close Browser


์ฺNB003
    Login To Website by Student
    Wait Until Element Is Visible    xpath=//li[contains(., 'ประวัติขอยืม')]
    Click Element                    xpath=//li[contains(., 'ประวัติขอยืม')]
    Click Element    xpath=//td[contains(., '1')]
    Click Button    xpath=//button[contains(., 'กลับ')]
    Close Browser

 