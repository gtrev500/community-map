119th Congressional Districts (Nov. 2024 Election, Active Jan. 2025 - Jan. 2027)

## RDH Date Retrieval
07/24/24

## Sources
U.S. Census

## Fields:
Field Name Description                  
***national_cong119_baf.csv***
GEOID20    Census Block GEOID
CONG119    Unique District Identifier
STATE      State Abbreviation
DISTRICT   District Number or 'AT-LARGE' or 'NO VALUE'

***national_cong119_boundary***
CONG119    Unique District Identifier
STATE      State Abbreviation
DISTRICT   District Number or 'AT-LARGE'

***national_cong119_carto_boundary***                  
CONG119    Unique District Identifier
STATE      State Abbreviation
DISTRICT   District Number or 'AT-LARGE'

## Processing Steps
Start from 118th Congressional District BAF shapefile on RDH website, which use the Census as a source.
Retrieve map information for all states that have changes from their 118th Congressional Districts: Alabama, Georgia, Louisiana, New York, and North Carolina from the various RDH state pages.
Where not available (Alabama, Louisiana*, and New York), construct a block-assignment file for each district plan by assigning each block to the district that overlaps with the majority of its area.
Use the 5 block assignment files to construct new district shapefiles entirely out of census blocks, to ensure precision and limit unintended overlaps with other geometries.
To construct the cartographic file, clip the district boundaries by a dissolved version of the 2018 cartographic file, for the states with new district plans. 

*Please note that Louisiana provides a BAF for its new Congressional plan, but that assignment uses edited block boundaries. The BAF in this file refers to the block geometries from the Census' 2020 TIGER boundaries.

Please direct questions related to processing this dataset to info@redistrictingdatahub.org.
