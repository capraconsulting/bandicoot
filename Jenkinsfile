#!/usr/bin/env groovy

// See https://github.com/capralifecycle/jenkins-pipeline-library
@Library('cals') _

buildConfig {
  dockerNode {
    checkout scm

    def img = docker.image('circleci/node:12-browsers')
    img.pull()
    img.inside {
      stage('Install dependencies') {
        sh 'npm ci'
        sh 'npm run bootstrap'
      }

      stage('Lint') {
        sh 'npm run lint'
      }

      stage('Build') {
        sh 'npm run build'
      }

      stage('Run e2e tests') {
        sh 'npm run test:e2e:jenkins'
      }
    }
  }
}
