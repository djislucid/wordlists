# Methodology

First step, establish a baseline. Capture:

- response size
- response time (avg of 3)
- pagination count / result length
- error structure format
- response schema shape (fields present/missing)

You will compare everything against this.

---

## Methodology

1. Baseline
1. Micro fuzz detection (base.txt with different encoding)
2. Detect semantic instability (input changed interpretation somewhere downstream?)
3. Classify parser
4. Semantic probes (type / structure / boolean)
5. Confirm behavioral primitive
6. Targeted exploitation tooling

---

## Probing

1. Initial micro fuzz list - Running base.txt in a few passes: raw, single urlencoded, double urlencoded, percent unicoded (optional backslash unicoded)

2. If no differential behavior detected, then move on. If any indicators detected, begin probing:
    1. Type Confusion list
      ↓
    2. Structure Mutation list
      ↓
    3. Boolean logic probes
      ↓
    4. Query Execution list
      ↓
    5. Evaluation probes
      ↓
    6. Resource timing probes

**Important Note:**
> Initially, make sure you replace the initial fuzz string that triggered the interesting behavior/error with these probes. Do not append. That may only come later, but for now you have no reason to believe you've detected an injection or what the syntax would even be.

**Replace or append? Decision table:**
| Observation                      | Action  |
| -------------------------------- | ------- |
| validator errors                 | REPLACE |
| inconsistent 500s                | REPLACE |
| accepted but behaves differently | APPEND  |
| dataset/result changes           | APPEND  |
| timing differences               | APPEND  |


If no further interesting behavior or indicators, then move on. Otherwise, you should be closing to actually attempting exploitation. It now may finally be time to utilize automated exploitation tooling. 

#### Indicators

- deterministic delay  
- response size change  
- authorization bypass behavior  
- dataset expansion/shrink  
- different validation error class  
- stack trace fingerprint changes  
- content-type change  
- pagination anomalies  
- cache behavior changes
- field omission/addition
- sorting/order changes

