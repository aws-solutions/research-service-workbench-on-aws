/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Effect, IPrincipal, PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam';
import _ from 'lodash';

export interface ComparisonResult {
  /**
   * true if the source and target of the comparison contain the same elements
   */
  isEqual: boolean;
  /**
   * the target contains all elements of the source but may contain additional elements.
   */
  targetContainsSource: boolean;
  /**
   * an array of elements provided in the source which were not found in the target.
   */
  inSourceNotTarget: string[] | IPrincipal[];
  /**
   * an array of elemenents provided in the target which were not found in the source.
   */
  inTargetNotSource: string[] | IPrincipal[];
}

export interface InsertStatementResult {
  /**
   * Set to true if the documentResult was updated.
   */
  documentUpdated: boolean;

  /**
   * The result of merging a statement into the document.
   * If the merge required no changes to the existing policy document,
   * this will be identical to the original.
   */
  documentResult: PolicyDocument;
}

export class IamHelper {
  public static containsStatementId(source: PolicyDocument, targetSid: string): boolean {
    const policyObj = source.toJSON();
    return (
      policyObj &&
      policyObj.Statement &&
      !!_.find(policyObj.Statement, (s) => {
        const statement: PolicyStatement = PolicyStatement.fromJson(s);
        return statement.sid === targetSid;
      })
    );
  }

  public static addPrincipalToStatement(
    source: PolicyDocument,
    targetSid: string,
    awsPrincipal: string
  ): PolicyDocument {
    const policyObj = source.toJSON();
    if (!policyObj || !policyObj.Statement) {
      throw new Error('Cannot add principal. Policy document is invalid');
    }
    const returnDoc = new PolicyDocument();
    _.forEach(policyObj.Statement, (s) => {
      if (s.Sid === targetSid) {
        if (!_.isArray(s.Principal.AWS)) s.Principal.AWS = [s.Principal.AWS];
        s.Principal.AWS.push(awsPrincipal);
        s.Principal.AWS = _.uniq(s.Principal.AWS);
      }
      const statement: PolicyStatement = PolicyStatement.fromJson(s);
      returnDoc.addStatements(statement);
    });
    return returnDoc;
  }

  /**
   * Verify the prinicpals in the source statement are covered by the list of prinicals in the
   * target statement.
   *
   * Note: At this time, the AnyPrincipal (*) is fully supported, but is treated as a single
   * distinct prinical.
   *
   * @param source - the PolicyStatement for which to search in target.
   * @param target - the PolicyStatement where source is to be found.
   * @returns true if the principals in the source statement are contained in the target statement.
   */
  public static compareStatementPrincipal(source: PolicyStatement, target: PolicyStatement): boolean {
    if (source.hasPrincipal !== target.hasPrincipal) return false;
    return this._doComparePrincipals(source.principals, target.principals).targetContainsSource;
  }

  /**
   * Verify two PolicyStatements contain the same effect (Allow/Deny).
   *
   * @param source - the PolicyStatement for which to search in target.
   * @param target - the PolicyStatement where source is to be found.
   * @returns true if the source and target have the same effect (both allow or both deny).
   */
  public static compareStatementEffect(source: PolicyStatement, target: PolicyStatement): boolean {
    return source.effect === target.effect;
  }

  /**
   * Verify the target PolicyStatement contains the Actions of the source PolicyStatement.
   * @param source - the PolicyStatement for which to search in target.
   * @param target - the PolicyStatement where source is to be found.
   * @returns true if the source actions are contained in the target actions.
   */
  public static compareStatementAction(source: PolicyStatement, target: PolicyStatement): boolean {
    return this.compareArrays(source.actions, target.actions).targetContainsSource;
  }

  /**
   * Verify the target PolicyStatement contains the Resources of the source PolicyStatement.
   * @param source - the PolicyStatement for which to search in target.
   * @param target - the PolicyStatement where source is to be found.
   * @returns true if the source resources are contained in the target resources.
   */
  public static compareStatementResource(source: PolicyStatement, target: PolicyStatement): boolean {
    return this.compareArrays(source.resources, target.resources).targetContainsSource;
  }

  /**
   * Check to see if a given list of strings is covered by the list of strings in a target list.
   * @param source - the source array.
   * @param target - the target array.
   *
   * @returns - a ComparisonResult detailing the differences in the arrays.
   */
  public static compareArrays(source: string[], target: string[]): ComparisonResult {
    const result: ComparisonResult = {
      isEqual: true,
      targetContainsSource: true,
      inSourceNotTarget: [],
      inTargetNotSource: []
    };

    result.inSourceNotTarget = _.difference(source, target);
    result.inTargetNotSource = _.difference(target, source);
    result.targetContainsSource = result.inSourceNotTarget.length === 0;
    result.isEqual = result.targetContainsSource && result.inSourceNotTarget.length === 0;
    return result;
  }

  /**
   * Determine if the source statement's conditions are the same as the target's.
   * Note: this will 'stringify' both the source and target and return the result of
   * a simple string equality.
   * @param source - the PolicyStatement for which to search in target.
   * @param target - the PolicyStatement where source is to be found.
   * @returns true if the string representations of the conditions objects are equal.
   */
  public static compareStatementCondition(source: PolicyStatement, target: PolicyStatement): boolean {
    return JSON.stringify(source.conditions) === JSON.stringify(target.conditions);
  }

  /**
   * Search for a statement within a PolicyDocument which satisifies the given statement.
   *
   * @param document - the PolicyDocument to be searched.
   * @param searchStatement - the statement for which to search.
   * @returns - true if a policy statement is found within the document which satisfies the staement.
   */
  public static policyDocumentContainsStatement(
    document: PolicyDocument,
    searchStatement: PolicyStatement
  ): boolean {
    const policyObj = document.toJSON();
    return (
      policyObj &&
      policyObj.Statement &&
      !!_.find(policyObj.Statement, (s) => {
        const statement: PolicyStatement = PolicyStatement.fromJson(s);
        return (
          IamHelper.compareStatementPrincipal(statement, searchStatement) &&
          IamHelper.compareStatementEffect(statement, searchStatement) &&
          IamHelper.compareStatementAction(statement, searchStatement) &&
          IamHelper.compareStatementResource(statement, searchStatement) &&
          IamHelper.compareStatementCondition(statement, searchStatement)
        );
      })
    );
  }

  /**
   * Add the effect of a statement to a policy document.
   *  - If the statement is found in the document, do nothing.
   *  - If an existing policy statement in the document differs by Principal ONLY
   * update that statement by adding the principal.
   *  - Otherwise, append the statement to the document.
   *
   * @param statement - the PolicyStatement to insert into the document.
   * @param document - the PolicyDocument into which the statement will be merged.
   *
   * @returns an InsertStatementResult object with the following properties:
   *   - documentUpdated: true if the resulting document differs from the original.
   *   - documentResult: if document updated is false, this is the original document,
   * otherwise, this will be the updated document with the statement added as above.
   */
  public static insertStatementIntoDocument(
    statement: PolicyStatement,
    document: PolicyDocument
  ): InsertStatementResult {
    const result: InsertStatementResult = {
      documentResult: document,
      documentUpdated: false
    };
    // if the document already effectively contains the statement, nothing to do.
    if (this.policyDocumentContainsStatement(document, statement)) return result;

    const policyObj = document.toJSON();
    const statementObj = _.get(policyObj, 'Statement');
    const statementObjects = _.map(statementObj, (s) => PolicyStatement.fromJson(s));

    if (statementObjects && statementObjects.length > 0) {
      const existingStatements: PolicyStatement[][] = _.partition(
        statementObjects,
        (s) =>
          s.effect === Effect.ALLOW &&
          IamHelper.compareArrays(statement.actions, s.actions).isEqual &&
          IamHelper.compareArrays(statement.resources, s.resources).isEqual &&
          IamHelper.compareStatementCondition(statement, s)
      );

      if (existingStatements.length > 0 && existingStatements[0] && existingStatements[0].length > 0) {
        const missingPrincipals: IPrincipal[] = IamHelper._doComparePrincipals(
          statement.principals,
          existingStatements[0][0].principals
        ).inSourceNotTarget as IPrincipal[];
        existingStatements[0][0].addPrincipals(...missingPrincipals);
        result.documentResult = new PolicyDocument();
        result.documentResult.addStatements(...existingStatements[0]);
        if (existingStatements[1] && existingStatements[1].length > 0)
          result.documentResult.addStatements(...existingStatements[1]);
        result.documentUpdated = true;
      }
    }

    if (!result.documentUpdated) {
      result.documentResult.addStatements(statement);
      result.documentUpdated = true;
    }

    return result;
  }

  private static _comparePrincipals(source: IPrincipal, target: IPrincipal): boolean {
    const sourceJson = source.policyFragment.principalJson;
    const targetJson = target.policyFragment.principalJson;

    return _.every(_.keys(sourceJson), (k) => {
      const prop = _.get(targetJson, k);
      if (!prop) return false;
      return _.every(_.get(sourceJson, k), (v) => _.find(prop, (i) => v === i));
    });
  }

  private static _doComparePrincipals(source: IPrincipal[], target: IPrincipal[]): ComparisonResult {
    const result: ComparisonResult = {
      isEqual: false,
      targetContainsSource: false,
      inSourceNotTarget: _.differenceWith(source, target, this._comparePrincipals),
      inTargetNotSource: _.differenceWith(target, source, this._comparePrincipals)
    };

    result.targetContainsSource = result.inSourceNotTarget.length === 0;
    result.isEqual = result.targetContainsSource && result.inTargetNotSource.length === 0;

    return result;
  }
}
