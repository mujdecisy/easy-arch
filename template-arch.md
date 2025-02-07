# !name! !version!
> [arc42](https://arc42.org/overview)

| Versions | Date | Authors |
| --- | --- | --- |
| !version! | !date! | !author! |

## 1. Introduction and Goals
Short description of the requirements, driving forces, extract (or abstract) of requirements. Top three (max five) quality goals for the architecture which have highest priority for the major stakeholders. A table of important stakeholders with their expectation regarding architecture.

## 2. Constraints
Anything that constrains teams in design and implementation decisions or decision about related processes. Can sometimes go beyond individual systems and are valid for whole organizations and companies.

## 3. Context and Scope
Delimits your system from its (external) communication partners (neighboring systems and users). Specifies the external interfaces. Shown from a business/domain perspective (always) or a technical perspective (optional)

### 3.1 Business Context View
Shows the system in its business context, including its communication partners and the business processes it supports.

### 3.2 Technical Context View
Shows the system in its technical context, including its communication partners and the technical interfaces it uses.

## 4. Solution Strategy
Summary of the fundamental decisions and solution strategies that shape the architecture. Can include technology, top-level decomposition, approaches to achieve top quality goals and relevant organizational decisions.

## 5. Building Block View
Static decomposition of the system, abstractions of source-code, shown as hierarchy of white boxes (containing black boxes), up to the appropriate level of detail.

## 6. Runtime View
Behavior of building blocks as scenarios, covering important use cases or features, interactions at critical external interfaces, operation and administration plus error and exception behavior.

## 7. Deployment View
Technical infrastructure with environments, computers, processors, topologies. Mapping of (software) building blocks to infrastructure elements.

## 8. Crosscutting Concepts
Overall, principal regulations and solution approaches relevant in multiple parts (→ cross-cutting) of the system. Concepts are often related to multiple building blocks. Include different topics like domain models, architecture patterns and -styles, rules for using specific technology and implementation rules.

## 9. Architectural Decisions
Important, expensive, critical, large scale or risky architecture decisions including rationales.

## 10. Quality Requirements
Quality requirements as scenarios, with quality tree to provide high-level overview. The most important quality goals should have been described in section 1.2. (quality goals).

## 11. Risks and Technical Debt
Known technical risks or technical debt. What potential problems exist within or around the system? What does the development team feel miserable about?

## 12. Glossary
Important domain and technical terms that stakeholders use when discussing the system. Also: translation reference if you work in a multi-language environment.

| Key | Value |
| --- | --- |
| Architecture | A set of structures needed to reason about the system |
| Stakeholder | A person or group of people who have an interest in the system |

## 13. References
List of all offline documents referenced in the ADR.
