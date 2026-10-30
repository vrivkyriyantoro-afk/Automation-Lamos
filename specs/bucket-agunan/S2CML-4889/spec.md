# SPEC: [S2CML-4889] [BE] LAMOS LOS SME - Bucket Agunan - Data Agunan > Add Agunan/Collaterals Part 1

## 1. Ringkasan Tiket Jira
- **Key**: [S2CML-4889](https://bank-sinarmas.atlassian.net/browse/S2CML-4889)
- **Tipe**: Story
- **Status**: In SIT
- **Ringkasan**: [BE] LAMOS LOS SME - Bucket Agunan - Data Agunan > Add Agunan/Collaterals Part 1
- **Bucket**: `bucket-agunan`

## 2. Deskripsi & User Story (Dari Jira)
User Story
 : 
As an 
Account Officer (AO)
, I want the system to check for existing collateral records when I add a new one, 
so that I can choose
 between 
reusing an existing record
 or 
creating a new one
 to prevent duplicate entries.
Scope 
: 
- Click Button
- Show Pop Up
- Search Existing Collaterals
- New Collaterals vs Load Existing Collaterals
Data Point : 
https://docs.google.com/spreadsheets/d/1XjImruERO3TaBZ0mN_sq2cq15QPJHTJYenujNgKWclA/edit?gid=1283138341#gid=1283138341
Flow : 
Acceptance Criteria
 : 
Scenario/ Requirement
Acceptance Criteria
Mockup
Add New Agunan
Given 
the Account Officer is on the "Collateral Summary" page of a loan application Then the system must display the "Tambah Agunan" button on the screen 
When 
the Account Officer clicks the "Tambah Agunan" button 
Then 
the system must display a pop-up modal 
stepper 
for new collateral entry And the pop-up must display the mandatory fields required to start the collateral creation process

 
Pop Up Modals
Given 
at pop-up modal 
stepper When 
AO in Pop Up Modals stepper Then he must follow up stage in stepper which is : 
- Stepper : Searching Existing Agunan (in CLS)
- Stepper : Show Search Result
- Stepper : Data Agunan
Step to Create New Agunan
- Searching and Selecting an Existing Collateral
Given 
the Account Officer is on Step 1 (Search Existing Agunan) 
of the "Tambah Agunan" pop-up modal When 
the Account Officer selects the option to use an "Existing Collateral" 
Then 
the system must require the user to input the "Jenis Kode Agunan" 
And 
the ownership document keywords, user also can input other key likes a kelurahan or desa
When 
the Account Officer enters the search criteria and triggers the search 
Then 
the system must display a list of collaterals matching the entered keywords 
And 
the Account Officer can select the matching collateral record from the list
When 
the result is not found Then System shall show a choice either user can search a new one or create new agunan by use button 
"Tambah Agunan Baru"

 
How to Search
Given 
AO input all value in 
Search Housing Type WHEN 
Use Klik Cari 
THEN 
System will query with : 
- Jenis Agunan (Exact Match)
- Bukti Kepemilikan (Include Match)
Note : Jika Value optional kosong, maka pencarian di ignore. Namun apabila ada isinya, maka menggunakan Operator “
AND
”
Step to Create New Agunan
- create/registers a brand new collaterals
Given 
the Account Officer is on Step 1 (Search Existing Collateral) of the "Tambah Agunan" pop-up modal 
When 
the Account Officer decides to add a collateral after not finding that his agunan is does not exist in the system And the Account Officer clicks the 
"Tambah Agunan Baru" 
button 
Then 
the system will show to the new collateral data entry form
Note : 
"Tambah Agunan Baru" 
will show after user cari collaterals
Jika Hasil Pencairan Kosong  : 
Jika Hasil Pencarian ada, namun tidak cocok dengan dokumen yang dia punya, sehingga user tetap bisa menekan tombol ‘
tambah baru’
Hasil Pencairan Error : 
Step to Create New Agunan
- registers an existing collaterals (From Master agunan at Core Loan System)
Given 
the Account Officer is on Step 1 (Search Existing Collateral) of the "Tambah Agunan" pop-up modal 
When 
the Account Officer decides to add a collateral from existing data 
Then 
User will follow this step : 
- Choose agunan from search Result
- Click Button Lanjutkan after choose one agunan
Show list Result : 
After Choose one Of Result
After Click Lanjutkan, Agunan Created  Loaded and will continue at Story 

 
How to Calculating existing Loan (When use paripasu)
When 
user choose agunan from existing data (CLS) 
Then 
system HIT service API Agunan to see value of registered at that agunan (Percentage of Paripasu).
IF There any “sisa” dari paripasu THEN system will use that value for calculation of agunan value
Contoh : 
- di CLS paripasu = Y dan Nilai Paripasu 100 atau . Paripasu = N, maka masuk ke Negative Case (1)
- di CLS paripasu = Y dan Nilai paripasu < 100. maka user bisa lanjut dengan :
- - apabila nilai appraisal belum ada, maka nilai agunan tersebut (yang dapat diagunkan adalah (100 - Nilai paripasu)*Nilai predictive
- apabila nilai agunan menurut pelapor sudah ada, maka nilai agunan tersebut (yang dapat diagunkan adalah (100 - Nilai paripasu) *
- nilai agunan menurut pelapor
Negative Case (1) : When Choose an Existing agunan, but the value it self is Used 100%
Given 
the Account Officer is on Step 1 (Search Existing Collateral) of the "Tambah Agunan" pop-up modal 
When 
the Account Officer decides to add a collateral from existing data but all values in collaterals is 100% or more is used 
Then System will block so that 
User cannot continue using this collaterals/agunan
Negative Case (2) : When Choose an Existing agunan, but it was duplicate from others agunan
Given 
the Account Officer is on Step 1 (Search Existing Collateral) of the "Tambah Agunan" pop-up modal 
When 
the Account Officer decides to add a collateral from existing data but actually agunan was already used in this proposal 
Then 
there will be notfication pop up that user can only choose others agunan


## 3. Kriteria Penerimaan (Acceptance Criteria)
Dokumen ini menjadi acuan utama verifikasi Playwright. Setiap skenario di atas wajib memiliki assertion di file test.

## 4. Prekondisi & Lingkungan Pengujian
- **Lingkungan**: SIT (`https://los-fe-coreloan-sit.devs.banksinarmas.com/`)
- **Autentikasi**: SSO Kratos (`pages/LoginPage.ts`)
- **Keamanan**: READ-ONLY saat eksplorasi awal.
