const AWS = require('aws-sdk');
const _ = require('underscore');
const async = require('async');
AWS.config.update({ region: 'ap-southeast-1' });

const ec2 = new AWS.EC2();

exports.handler = async (event) => {
  let addressData = await ec2.describeAddresses({}).promise();
  let AssociationId = addressData.Addresses[0].AssociationId;
  let AllocationId = addressData.Addresses[0].AllocationId;
  let EC2InstanceId = addressData.Addresses[0].InstanceId;

  // disassociate Elastic IP
  let disassociateResult = await ec2.disassociateAddress({
    AssociationId: AssociationId
  }).promise();

  // release Elastic IP
  let releaseResult = await ec2.releaseAddress({
    AllocationId: AllocationId
  }).promise();

  // allocate new Elastic IP
  let allocateData = await ec2.allocateAddress({
    Domain: "vpc"
  }).promise();

  let PublicIp = allocateData.PublicIp;
  let newAllocationId = allocateData.AllocationId;

  // associate Elastic IP with instance
  let associateResult = await ec2.associateAddress({
    AllocationId: newAllocationId, 
    InstanceId: EC2InstanceId
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(PublicIp)
  }
}